rm deploy.zip
zip -r deploy.zip . -x *.zip *.git* ./.env
echo "/-------------------------"
echo "|UPLOADING TO LAMBDA LAND|"
echo "-------------------------/"
aws lambda update-function-code --function-name $1 --zip-file fileb://./deploy.zip