@echo off
echo Dang nhap du lieu (Importing database)...
docker exec -i mysql_clean_db mysql -u clean_user -puser_secret_password CleanDb < database\init.sql
echo Hoan tat! Du lieu da duoc dong bo vao database tren may cua ban.
pause
