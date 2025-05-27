#!/bin/bash
# Push all files in the current workspace to the master branch

git add .
git commit -m "chore: push all workspace files (code, public, assets, etc) to master"
git push origin master
