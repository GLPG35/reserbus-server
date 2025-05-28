create database reserbus if not exists;
use reserbus;

create table user (
  id char(36) not null,
  ci char(8) not null unique,
  name varchar(32) not null,
  lastname varchar(32) not null,
  email varchar(64) not null unique,
  password binary(60) not null,
  role enum('user', 'admin') default 'user',
  createdAt timestamp default current_timestamp,
  disabled bool default false,
  primary key (id)
);

create table tel (
  id char(36) not null,
  number varchar(15), -- El teléfono más largo del mundo tiene 15 digitos segun Google.
  primary key (id, number),
  foreign key (id) references user(id)
);

create table vehicle (
  id char(36) not null,
  type enum('bus', 'minibus', 'microbus') not null, 
  capacity int not null,
  availableTime time,
  createdAt timestamp default current_timestamp,
  disabled bool default false,
  primary key (id)
);

create table route (
  id char(36) not null,
  origin varchar(32) not null,
  destination varchar(32) not null,
  duration time,  
  primary key (id)
);

create table stop (
	id char(36) not null,
  routeId char(36) not null,
  name varchar(32) not null,
  primary key (id, routeId),
  foreign key (routeId) references route(id)
);

create table reservation (
  id char(36) not null,
  userId char(36) not null,
  vehicleId char(36),
  routeId char(36) not null,
  vehicleType enum('bus', 'minibus', 'microbus') not null,
  createdAt timestamp default current_timestamp,
  tripDate datetime not null,
  status enum('pendiente', 'confirmada', 'cancelada') default 'pendiente',
  amount decimal(10, 2),
  primary key (id),
  foreign key (userId) references user(id),
  foreign key (vehicleId) references vehicle(id),
  foreign key (routeId) references route(id)
);

create table paymentmethod (
  id char(36) not null,
  userId char(36) not null,
  name varchar(32) not null,
  details text,
  primary key (id),
  foreign key (userId) references user(id)
);

create table payment (
  id char(36) not null,
  reservationId char(36) not null,
  methodId char(36) not null,
  amount decimal(10, 2) not null,
  createdAt timestamp default current_timestamp,
  primary key (id),
  foreign key (reservationId) references reservation(id),
  foreign key (methodId) references paymentmethod(id)
);

insert into user (id, ci, name, lastname, email, password, role)
values (
	'019700a0-14ca-7000-b37d-41186488164c',
  55610793,
  'Administrador',
  'Ingeniería',
  'admin@gmail.com',
  '$2b$10$iQJPHpLEmqjWfczhu8R9KOV2SINL/4s0W9AJ4OiBOEhLtAqWnZKA2',
  'admin'
);

insert into vehicle (id, type, capacity, availableTime)
values
(
  '019718a2-e5d7-7000-a127-8a64c816dcf9',
  'bus',
  36,
  '08:00:00'
), (
	'019718a3-66fa-7000-b44b-4defd7c1b986',
  'minibus',
  25,
  '17:00:00'
), (
	'019718a4-67ce-7000-b683-ba09322bc74b',
  'microbus',
  18,
  '13:00:00'
);