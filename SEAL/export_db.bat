@echo off
echo Dang xuat du lieu (Exporting database)...
docker exec mysql_clean_db mysqldump --no-tablespaces -u clean_user -puser_secret_password CleanDb > database\init.sql
echo Hoan tat! File database/init.sql da duoc cap nhat. Ban co the git add va git commit file nay.
pause
