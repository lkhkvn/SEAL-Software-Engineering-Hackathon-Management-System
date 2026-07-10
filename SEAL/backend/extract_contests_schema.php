<?php
$content = file_get_contents('/var/www/html/init.sql');
$lines = explode("\n", $content);
$tableStatement = '';
$found = false;
foreach ($lines as $line) {
    if (strpos($line, 'CREATE TABLE `contests`') !== false) {
        $tableStatement .= $line . "\n";
        $found = true;
        continue;
    }
    if ($found) {
        if (strpos($line, 'ENGINE=InnoDB') !== false) {
            $tableStatement .= $line . "\n";
            break; // End of statement
        }
        $tableStatement .= $line . "\n";
    }
}
file_put_contents('/var/www/html/contests_schema.sql', "SET FOREIGN_KEY_CHECKS = 0;\nDROP TABLE IF EXISTS `contests`;\n" . $tableStatement . "\n");
echo "Created contests_schema.sql successfully!\n";
