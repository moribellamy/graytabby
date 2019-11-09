LOGO=dist/assets/img/blobbycat/browseraction128.png

if [[ "$NODE_ENV" == "development" ]]; then
  if [[ -f `which convert` ]]; then
    echo "doing flippycat"
    convert -flip $LOGO $LOGO
  else
    echo "'convert' not found on path, skipping flippycat"
  fi
else
  echo "production build; no flippycat"
fi
