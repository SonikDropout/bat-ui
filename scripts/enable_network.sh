while read service; do sudo systemctl enable "${service}"; done < ~/bat-ui/unused-packages.list
