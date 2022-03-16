import { Migration } from '@mikro-orm/migrations'

export class SetDbSchema extends Migration {
  // prettier-ignore
  async up(): Promise<void> {
    this.addSql('create table "master_access_level" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "name" varchar(255) not null, "description" varchar(255) not null, "is_fixed" boolean not null, "permissions" text[] not null default \'{}\');');

    this.addSql('create table "unregistered_user" ("uuid" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" varchar(255) null, "email" varchar(255) null, "email_verified" boolean not null default false, "oauth_provider" varchar(255) not null, "oauth_profile_id" varchar(255) not null);');
    this.addSql('alter table "unregistered_user" add constraint "unregistered_user_pkey" primary key ("uuid");');

    this.addSql('create table "organization" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "name" varchar(255) not null, "deleted_at" timestamptz(0) null, "blocked" boolean not null, "billing_email" varchar(255) not null, "billing_email_verified" boolean not null default false, "owner_id" int null);');
    this.addSql('alter table "organization" add constraint "organization_billing_email_unique" unique ("billing_email");');
    this.addSql('alter table "organization" add constraint "organization_owner_id_unique" unique ("owner_id");');

    this.addSql('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "username" varchar(255) not null, "last_login" timestamptz(0) null, "email" varchar(255) not null, "email_verified" boolean not null default false, "password" varchar(255) not null, "reset_password_token" text null, "google_profile_id" varchar(255) null, "auto_login_token" text null, "organization_id" int not null, "access_level_id" int not null);');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
    this.addSql('alter table "user" add constraint "user_google_profile_id_unique" unique ("google_profile_id");');

    this.addSql('create table "access_level" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "name" varchar(255) not null, "description" varchar(255) not null, "is_fixed" boolean not null, "permissions" text[] not null default \'{}\', "organization_id" int null);');

    this.addSql('create table "master_user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "username" varchar(255) not null, "last_login" timestamptz(0) null, "email" varchar(255) not null, "email_verified" boolean not null default false, "password" varchar(255) not null, "reset_password_token" text null, "access_level_id" int null, "master_access_level_id" int not null);');
    this.addSql('alter table "master_user" add constraint "master_user_email_unique" unique ("email");');

    this.addSql('create table "vehicle" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "plate" varchar(255) not null, "photo" varchar(255) null, "model_year" smallint null, "fabrication_year" smallint null, "chassis_number" varchar(255) null, "brand" varchar(255) null, "model" varchar(255) null, "renavam" varchar(255) null, "color" varchar(255) null, "organization_id" int not null);');
    this.addSql('alter table "vehicle" add constraint "vehicle_plate_organization_id_unique" unique ("plate", "organization_id");');

    this.addSql('create table "tracker" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "model" varchar(255) not null, "organization_id" int not null, "vehicle_id" int null);');

    this.addSql('create table "sim_card" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "phone_number" varchar(255) not null, "ssn" varchar(255) not null, "apn_address" varchar(255) not null, "apn_user" varchar(255) not null, "apn_password" varchar(255) not null, "organization_id" int not null, "tracker_id" int null);');
    this.addSql('alter table "sim_card" add constraint "sim_card_phone_number_unique" unique ("phone_number");');
    this.addSql('alter table "sim_card" add constraint "sim_card_ssn_unique" unique ("ssn");');

    this.addSql('alter table "organization" add constraint "organization_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade on delete set null;');

    this.addSql('alter table "user" add constraint "user_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on update cascade;');
    this.addSql('alter table "user" add constraint "user_access_level_id_foreign" foreign key ("access_level_id") references "access_level" ("id") on update cascade;');

    this.addSql('alter table "access_level" add constraint "access_level_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on update cascade on delete set null;');

    this.addSql('alter table "master_user" add constraint "master_user_access_level_id_foreign" foreign key ("access_level_id") references "access_level" ("id") on update cascade on delete set null;');
    this.addSql('alter table "master_user" add constraint "master_user_master_access_level_id_foreign" foreign key ("master_access_level_id") references "master_access_level" ("id") on update cascade;');

    this.addSql('alter table "vehicle" add constraint "vehicle_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on update cascade;');

    this.addSql('alter table "tracker" add constraint "tracker_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on update cascade;');
    this.addSql('alter table "tracker" add constraint "tracker_vehicle_id_foreign" foreign key ("vehicle_id") references "vehicle" ("id") on update cascade on delete set null;');

    this.addSql('alter table "sim_card" add constraint "sim_card_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on update cascade;');
    this.addSql('alter table "sim_card" add constraint "sim_card_tracker_id_foreign" foreign key ("tracker_id") references "tracker" ("id") on update cascade on delete set null;');
  }
}