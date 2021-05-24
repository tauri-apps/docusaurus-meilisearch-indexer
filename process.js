const SimpleMarkdown = require("simple-markdown");
const fs = require("fs");
const slugger = require("github-slugger")();
const stripTags = require("@ramumb/strip-tags");
const core = require("@actions/core");
const { MeiliSearch } = require("meilisearch");

const mdParse = SimpleMarkdown.defaultBlockParse;
const getTitle = (markdown) => /title:\s*([^\n\r]*)[^-]*---/.exec(markdown)[1];

let objectID = 1;
const getObjectID = () => objectID++;

const INDEX = core.getInput("version").replace(/\W/g, "_");
const PATH = core.getInput("docusaurusPath");
const API_KEY = core.getInput("apiKey");
const HOST = core.getInput("host");
const DOCS = core.getInput("docs").split(",");

const createIndex = (data) => {
  const requiredFields = ["hierarchy_lvl0", "hierarchy_lvl1", "url"];
  const missingFields = requiredFields.filter(
    (requiredField) => !data[requiredField]
  );
  if (missingFields.length) {
    throw new Error(
      `Missing fields for indexing page ${data.url}: ${missingFields.join(
        ", "
      )}`
    );
  }
  return {
    objectID: getObjectID(),
    hierarchy_radio_lvl0: null,
    hierarchy_radio_lvl1: null,
    hierarchy_radio_lvl2: null,
    hierarchy_radio_lvl3: null,
    hierarchy_radio_lvl4: null,
    hierarchy_radio_lvl5: null,
    hierarchy_lvl0: null,
    hierarchy_lvl1: null,
    hierarchy_lvl2: null,
    hierarchy_lvl3: null,
    hierarchy_lvl4: null,
    hierarchy_lvl5: null,
    hierarchy_lvl6: null,
    content: null,
    anchor: null,
    ...data,
  };
};

const indexes = [];

const clearHierarchyLevelsTo = (baseData, level) => {
  for (let i = getNextHierarchyLevel(baseData); i >= level; --i) {
    baseData["hierarchy_lvl" + i] = null;
  }
};

const getContent = (contents) =>
  stripTags(
    contents
      .map((content) =>
        Array.isArray(content.content)
          ? getContent(content.content)
          : content.content
      )
      .join("")
  ).replace(/&nbsp;/g, "");

const processFile = (path, baseData) => {
  const md = fs.readFileSync(`${PATH}/docs/en/${path}.md`, {
    encoding: "utf8",
  });

  const title = getTitle(md);

  const syntaxTree = mdParse(md);

  let pageBaseData = {
    ...baseData,
    url: path,
    [getNextHierarchyLevel(baseData)]: title,
  };

  indexes.push(createIndex(pageBaseData));

  let lastNodeLevel = 1;
  syntaxTree.forEach((node, index) => {
    if (
      node.type !== "heading" ||
      (node.type === "heading" && node.level > 3)
    ) {
      return;
    }

    let content;
    if (syntaxTree[index + 1] && syntaxTree[index + 1].type === "paragraph") {
      content = getContent(syntaxTree[index + 1].content);
    }

    let levelHierarchy;
    if (node.level > lastNodeLevel) {
      levelHierarchy = getNextHierarchyLevel(pageBaseData);
    } else {
      levelHierarchy = lastNodeLevel - node.level;
      clearHierarchyLevelsTo(pageBaseData, levelHierarchy);
    }
    indexes.push(
      createIndex({
        ...pageBaseData,
        content,
        [levelHierarchy]: getContent(node.content),
        anchor: slugger.slug(getContent(node.content)),
      })
    );
  });
  slugger.reset();
};

const getNextHierarchyLevel = (data) => {
  for (let i = 0; i <= 6; ++i) {
    if (!data["hierarchy_lvl" + i]) {
      return "hierarchy_lvl" + i;
    }
  }
  throw new Error("Maximum depth reached, rework the indexer.");
};

const fetchIndexes = (node, baseData) => {
  if (typeof node === "string") {
    processFile(node, baseData);
  } else if (node.items) {
    const nextData = {
      ...baseData,
      [getNextHierarchyLevel(baseData)]: node.label,
    };
    node.items.forEach((node) => fetchIndexes(node, nextData));
  }
};

require(`${PATH}/sidebars.js`)
  .docs.filter((lvl0) => DOCS.includes(lvl0.label))
  .forEach(fetchIndexes, {
    hierarchy_lvl0: null,
    hierarchy_lvl1: null,
    hierarchy_lvl2: null,
    hierarchy_lvl3: null,
    hierarchy_lvl4: null,
    hierarchy_lvl5: null,
    hierarchy_lvl6: null,
  });

const client = new MeiliSearch({
  host: HOST,
  apiKey: API_KEY,
});

client
  .index(INDEX)
  .addDocuments(docs)
  .then((res) => console.log(res));
