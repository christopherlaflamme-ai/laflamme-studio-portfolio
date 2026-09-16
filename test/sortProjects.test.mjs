import { test } from "node:test";
import assert from "node:assert/strict";
import { sortProjects } from "../lib/sortProjects.mjs";

test("featured projects come before non-featured", () => {
  const input = [
    { title: "A", featured: false, featured_order: null, year: 2024 },
    { title: "B", featured: true, featured_order: 1, year: 2020 },
  ];
  const result = sortProjects(input);
  assert.deepEqual(result.map((p) => p.title), ["B", "A"]);
});

test("featured projects sort by featured_order ascending", () => {
  const input = [
    { title: "A", featured: true, featured_order: 2, year: 2020 },
    { title: "B", featured: true, featured_order: 1, year: 2020 },
  ];
  const result = sortProjects(input);
  assert.deepEqual(result.map((p) => p.title), ["B", "A"]);
});

test("featured projects with null featured_order fall back to year descending", () => {
  const input = [
    { title: "Old", featured: true, featured_order: null, year: 2019 },
    { title: "New", featured: true, featured_order: null, year: 2024 },
  ];
  const result = sortProjects(input);
  assert.deepEqual(result.map((p) => p.title), ["New", "Old"]);
});

test("non-featured projects sort by year descending", () => {
  const input = [
    { title: "Old", featured: false, featured_order: null, year: 2018 },
    { title: "New", featured: false, featured_order: null, year: 2023 },
  ];
  const result = sortProjects(input);
  assert.deepEqual(result.map((p) => p.title), ["New", "Old"]);
});

test("does not mutate the input array", () => {
  const input = [
    { title: "A", featured: false, featured_order: null, year: 2020 },
    { title: "B", featured: true, featured_order: 1, year: 2020 },
  ];
  const originalOrder = input.map((p) => p.title);
  sortProjects(input);
  assert.deepEqual(input.map((p) => p.title), originalOrder);
});
