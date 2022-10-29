#! /bin/bash

TARGET="src/assets/font-awesome/css/font-awesome.min.css"

sed 's/?v=4.7.0//g' "$TARGET" > "$TARGET.new"
cp "$TARGET" "$TARGET.old"
mv "$TARGET.new" "$TARGET"

#sed -i 's/?v=4.7.0//g' /var/www/splitman/html/assets/font-awesome/css/font-awesome.css
#sed -i 's/?v=4.7.0//g' /var/www/splitman/html/assets/font-awesome/css/font-awesome.min.css
#sed -i 's/&v=4.7.0//g' /var/www/splitman/html/assets/font-awesome/css/font-awesome.css
#sed -i 's/&v=4.7.0//g' /var/www/splitman/html/assets/font-awesome/css/font-awesome.min.css
