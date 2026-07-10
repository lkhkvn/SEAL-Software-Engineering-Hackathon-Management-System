<?php
$content = file_get_contents('/var/www/html/init.sql');
$lines = explode("\n", $content);
foreach ($lines as $line) {
    if (strpos($line, 'INSERT INTO `contests`') !== false) {
        echo substr($line, 0, 800) . "...\n";
    }
}
