






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
npm publish
