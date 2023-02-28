
## Description
This PR fixes a simple case in which a PR will always result in a failing test.

The case is as follows:
- a PR adds a new `npm` package and uses it in any cypress test.
- the visual regression test starts its initialization by checking out the cypress tests of the PR head
- those cannot be loaded due to the missing `npm` package in the base ref (`master`-branch).

The fix is simply loading the recent tests together with its `package.json` and `yarn.lock` and then installing the `devDependencies` before starting the tests.

**Disadvantage** is that the method would never "see" visual changes due to a change in the testing framework, i.e. a cypress update.

## Motivation and Context
See #908.

## How Has This Been Tested?
Ran the actions for #908 together with the proposed change.

## Types of changes
- [x] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Code refactor or cleanup (changes to existing code for improved readability or performance)

## Checklist:
- [ ] I adapted the version number under `py/visdom/VERSION` according to [Semantic Versioning](https://semver.org/)
- [ ] My code follows the code style of this project.
- [ ] My change requires a change to the documentation.
- [ ] I have updated the documentation accordingly.
