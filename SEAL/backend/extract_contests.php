<?php
$content = file_get_contents('/var/www/html/init.sql');
$lines = explode("\n", $content);
$insertStatement = '';
$found = false;
foreach ($lines as $line) {
    if (strpos($line, 'INSERT INTO `contests`') !== false) {
        $insertStatement .= $line . "\n";
        $found = true;
        continue;
    }
    if ($found) {
        if (strpos($line, '/*!') === 0 || strpos($line, 'UNLOCK TABLES;') === 0 || strpos($line, 'INSERT INTO') === 0) {
            break; // End of statement
        }
        $insertStatement .= $line . "\n";
    }
}
file_put_contents('/var/www/html/contests_data.sql', "SET FOREIGN_KEY_CHECKS = 0;\nTRUNCATE TABLE contests;\n" . $insertStatement . "SET FOREIGN_KEY_CHECKS = 1;\n");
echo "Created contests_data.sql successfully!\n";
