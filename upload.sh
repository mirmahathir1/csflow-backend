echo "Enter commit message: "
read -r message
echo "The commit message is: $message"
git add .
git commit -am "$message"
git fetch
git merge
git push origin master
git push heroku master