# This program will upload to git

cd /home/holzel/Code/Jfiles/

echo Type in the file name please: 
read varname

git add $varname


echo Type in commit message...

read varmessage
git commit -m "$varmessage"

git push origin master


