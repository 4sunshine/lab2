//******************************INFORMATION*****************************************//
VM:
	login: [your login]
	password: [your password]
	IP: [IP]

MySQL
	mysql users:
		password [name root user] : [password root user]
		password [name user] : [password user]

	database:
		name: Works	
		TABELES: 
			- Grades:
				1. Id int unsigned PRIMARY KEY 
				2. Fileid int unsigned
				3. Mark decimal(1)
				4. Comment varchar(500)
			- Workfiles:
				1. Id int unsigned PRIMARY KEY auto increment 
				2. Filename varchar(150) UNIQUE
				3. Markscount smallint unsigned DEFAULT 0

Запуск сервера:
	Запуск VM
	MySQL запускается автоматически


//******************************RESOURCES*****************************************//
Установка и настройка MySQL в Ubuntu 18.04:
	[https://devenergy.ru/archives/306] - создание и настройка VM под MySQL
	[https://www.digitalocean.com/community/tutorials/mysql-ubuntu-18-04-ru] - установка и настройка MySQL
	[https://www.digitalocean.com/community/tutorials/how-to-allow-remote-access-to-mysql] - удаленный доступ к MySQL
Справочное руководство по MySQL:
[http://www.mysql.ru/docs/man/Retrieving_data.html]
