import { test } from "node:test";
import assert from "node:assert/strict";
import { filterProjectsByCategories } from "../lib/filterProjectsByCategories.mjs";

const projects = [
  { title: "A", categories: ["Web Design"] },
  { title: "B", categories: ["Visual Identity"] },
  { title: "C", categories: ["Web Design", "Photography"] },
];

test("empty selection returns all projects", () => {
  const result = filterProjectsByCategories(projects, []);
  assert.deepEqual(result.map((p) => p.title), ["A", "B", "C"]);
});

test("single selected category returns only matching projects", () => {
  const result = filterProjectsByCategories(projects, ["Visual Identity"]);
  assert.deepEqual(result.map((p) => p.title), ["B"]);
});

test("multiple selected categories use OR logic", () => {
  const result = filterProjectsByCategories(projects, ["Visual Identity", "Photography"]);
  assert.deepEqual(result.map((p) => p.title), ["B", "C"]);
});

test("selection matching nothing returns an empty array", () => {
  const result = filterProjectsByCategories(projects, ["Illustrative Design"]);
  assert.deepEqual(result, []);
});
