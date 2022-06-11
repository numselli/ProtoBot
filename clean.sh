#!/bin/bash
# Clean the Lexi workspace of unnecessary compilation
# archives that are messy and hard to code with.

TMPDIR="$(mktemp -d /tmp/Lexi.clean.XXXXXXXX)"
echo "distclean: Copying out important data to $TMPDIR..."
cp -r ./dist/data/* $TMPDIR/
echo "distclean: Clearing dist..."
rm -rf ./dist/*
echo "distclean: Replacing data..."
mkdir dist/data
cp -r $TMPDIR/* ./dist/data/
echo "distclean: Cleaning up..."
rm -rf $TMPDIR
echo "distclean: Done."