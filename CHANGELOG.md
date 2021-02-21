# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.4.0](https://github.com/nether-cat/nether-db/compare/v1.3.0...v1.4.0) (2021-02-21)


### Features

* **datasets:** Add more datasets and fix metadata for lake "Gosciaz" ([4c0fa35](https://github.com/nether-cat/nether-db/commit/4c0fa35ee431352cc315955c8532b68583b2ca15))
* **datasets:** Integrate datasets from lake "Gosciaz" ([3a18ab2](https://github.com/nether-cat/nether-db/commit/3a18ab276167d2c65a8657f44a61f75c4329c36c))
* **frontend:** Integrate extra metadata into the API and the UI ([7ac6ce3](https://github.com/nether-cat/nether-db/commit/7ac6ce33842b672f282e82aeca5ce53ce43add64))
* **frontend:** Show an anchor linked to the original data source ([a0f5884](https://github.com/nether-cat/nether-db/commit/a0f58845546197c6d632178e75df058122aa45aa))
* **news:** Substitute actual news for the useless placeholders ([7a5594e](https://github.com/nether-cat/nether-db/commit/7a5594ea040fc5ae9908867c2717b626231f60ab))


### Bug Fixes

* **backend:** Conditionally convert query variables for `neo4j-driver` ([d51b425](https://github.com/nether-cat/nether-db/commit/d51b425719ab5ca83e74eeead4e9918cefafa149))
* **datasets:** Add final DOIs to the datasets for lake "Gosciaz" ([3bafc54](https://github.com/nether-cat/nether-db/commit/3bafc5480c1c3c505d9c90f64b4ad50bd14d8fdd))
* **datasets:** Add missing metadata for samples from lake "Gosciaz" ([28bcde5](https://github.com/nether-cat/nether-db/commit/28bcde51d8b9de7085f7186d6d6ba4440a4bc003))
* **frontend:** Change window title and hide inactive nav items ([9f955aa](https://github.com/nether-cat/nether-db/commit/9f955aa0865448bb2b88654762f21563d6e3c325))
* **frontend:** Include more metadata when generating CSV ([47ee219](https://github.com/nether-cat/nether-db/commit/47ee2195cf31db6c1147c15397b8a8a2b16dbf08))
* **frontend:** Remove excess whitespace from an anchor element ([aef8395](https://github.com/nether-cat/nether-db/commit/aef8395e3a92f4d5f662b6957a39aeb957621bcd))
* **frontend:** Sort datasets in the detail view by default ([186fa8a](https://github.com/nether-cat/nether-db/commit/186fa8af48eae49e06ff88d0fb639b0033f9ae56))
* **import:** Add comment for a query that possibly is destructive ([2aa5700](https://github.com/nether-cat/nether-db/commit/2aa57006d5adaf1fd2b9c7ac04933ddb50884c9c))
* **import:** Add patch to be applied if host still runs Neo4j v3.x ([021ae18](https://github.com/nether-cat/nether-db/commit/021ae1853e0a28059264dfa38666e1a8e00c2807))
* **import:** Delete stale links between datasets and attributes ([02ad91a](https://github.com/nether-cat/nether-db/commit/02ad91ab29c885afa7740553363384f9857a3c08))

## [1.3.0](https://github.com/nether-cat/nether-db/compare/v1.2.0...v1.3.0) (2020-07-25)


### Features

* **display:** Show information about auxiliary depths and error margins ([f2a7c60](https://github.com/nether-cat/nether-db/commit/f2a7c60820d2fc8e7d36d6c4a50b3b9ede23f268))


### Bug Fixes

* **datasets:** Resolve issues with metadata and missing datasets ([2d0402d](https://github.com/nether-cat/nether-db/commit/2d0402dad23eda9debf1f7cfaf193616c8dac3ef))
* **frontend:** Provide multiple minor fixes and improvements ([3c5ea1f](https://github.com/nether-cat/nether-db/commit/3c5ea1f8372e18d93b67ef428707012f7b694f01)), closes [#24](https://gitlab.forgefire.net/gfz/nether-db/issues/24) [#25](https://gitlab.forgefire.net/gfz/nether-db/issues/25) [#26](https://gitlab.forgefire.net/gfz/nether-db/issues/26) [#27](https://gitlab.forgefire.net/gfz/nether-db/issues/27)

## [1.2.0](https://github.com/nether-cat/nether-db/compare/v1.1.0...v1.2.0) (2020-06-11)


### Features

* **datasets:** Integrate samples from lake "Chatyr Kol" ([42628a8](https://github.com/nether-cat/nether-db/commit/42628a823fe35adc12b8473ebe92a3269b529242))
* **import:** Support filters to import/update only matching files ([bb06acf](https://github.com/nether-cat/nether-db/commit/bb06acfd0509b2171a9ed09b7e9d711c7295c0bc))

## [1.1.0](https://github.com/nether-cat/nether-db/compare/v1.0.0...v1.1.0) (2020-02-05)


### Features

* **export:** Sort properties and also generate CSV files ([b49ea7f](https://github.com/nether-cat/nether-db/commit/b49ea7f08e4eb2567665e9d75ede15c6ea09fb05))


### Bug Fixes

* **datasets:** Fix stored information on the original sources ([da3a466](https://github.com/nether-cat/nether-db/commit/da3a466fd09fd34c03dd45de23162aaa2da2efa8))

## 1.0.0 (2019-11-22)


### Features

* **auth:** Allow unauthenticated users to access the database ([f2dee76](https://github.com/nether-cat/nether-db/commit/f2dee76dd82cbbd5d3fcc0429c5d63b24d4eb2cc)), closes [#21](https://gitlab.forgefire.net/gfz/nether-db/issues/21)
* **contact:** Enable everyone to contact site admins using a form ([4035da9](https://github.com/nether-cat/nether-db/commit/4035da91df75e355090363f83a1190ec2e9158fb)), closes [#16](https://gitlab.forgefire.net/gfz/nether-db/issues/16)
* Provide an imprint with legal information about the site ([393707c](https://github.com/nether-cat/nether-db/commit/393707c7b62b31991c9827139915e1beb29c67cc)), closes [#15](https://gitlab.forgefire.net/gfz/nether-db/issues/15)


### Bug Fixes

* **style:** Improve the display of labels for disabled form fields ([d394fb1](https://github.com/nether-cat/nether-db/commit/d394fb169bed6bde2c21ae466aec429343a255ac))
* Handle an `undefined` component state before accessing its fields ([5e8c239](https://github.com/nether-cat/nether-db/commit/5e8c2391865fced1b36ef0c7c05d900eef8aef5c))
