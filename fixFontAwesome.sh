#! /bin/bash

TARGET="src/assets/font-awesome/css/font-awesome.min.css"

sed 's/?v=4.7.0//g' "$TARGET" > "$TARGET.new"
cp "$TARGET" "$TARGET.old"
mv "$TARGET.new" "$TARGET"
