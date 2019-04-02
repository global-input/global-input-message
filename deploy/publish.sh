projectversion=`grep -A 1 -B 2 '"name": "global-input-message",' package.json | grep '"version":' | sed 's,"version": ",,g' | sed 's-",--g'`
echo $projectversion
lastdigit="${projectversion##*.}"
maninVersion="${projectversion%.*}"
nextDigit=$((lastdigit+1))
nextVersion="$maninVersion.$nextDigit"
echo $nextVersion

git add .
git commit -m "update"



git push origin


npm version $nextVersion

git add .
git commit -m "version"

git push origin


git tag -a v$nextVersion -m "released a new version: $nextVersion"
git checkout v$nextVersion
git push origin
git checkout develop




#browserify    -r ./distribution/index.js:global-input-message  > distribution/globalinputmessage.js

#cat distribution/globalinputmessage.js | uglifyjs > distribution/globalinputmessage.min.js

#npm publish

#git checkout master
#git merge develop

#npm push origin *:*
#git checkout develop
