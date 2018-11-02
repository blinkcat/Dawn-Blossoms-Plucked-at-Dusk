#!/bin/sh

getLineNum(){
	echo $(grep -n $1 README.md | cut -d : -f 1)
}

insert_line=$(getLineNum "<!--treebegin-->")
begin_line=`expr $insert_line + 1`
end_line=`expr $(getLineNum "<!--treeend-->") - 1`

echo "\n\`\`\`sh" > tempmd
tree src --prune -P *.html --noreport >> tempmd
echo "\`\`\`\n" >> tempmd

sed -i -e "$begin_line,$end_line d" README.md
sed -i -e "$insert_line r tempmd" README.md

rm tempmd
