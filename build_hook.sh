LOGO=dist/assets/img/blobbycat/browseraction128.png

if [[ "$NODE_ENV" == "development" ]]; then
  if [[ -f `which convert` ]]; then
    echo "development build; doing flippycat"
    convert -flip $LOGO $LOGO
  else
    echo "'convert' not found on path; skipping flippycat"
  fi
else
  echo "production build; skipping flippycat"
fi

VERSION=`egrep -oe '.*"version":.*' manifest.json`
VERSION=`echo "$VERSION" | egrep -oe '(\d+[.]?)+'`

if [[ "$NODE_ENV" == "development" ]]; then
  VERSION="$VERSION-`date +"%T"`"
fi

echo "stamping build with $VERSION"
sed -i '' "s/!!VERSION!!/$VERSION/" dist/app.html
