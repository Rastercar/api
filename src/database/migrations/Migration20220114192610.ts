import { Migration } from '@mikro-orm/migrations'

export class Migration20220114192610 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "unregistered_user" ("uuid" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" varchar(255) null, "email" varchar(255) null, "email_verified" bool not null default false, "oauth_provider" varchar(255) not null, "oauth_profile_id" varchar(255) not null);'
    )
    this.addSql('alter table "unregistered_user" add constraint "unregistered_user_pkey" primary key ("uuid");')

    this.addSql(
      'create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "username" varchar(255) not null, "last_login" timestamptz(0) null, "email" varchar(255) not null, "email_verified" bool not null default false, "password" varchar(255) not null, "oauth_provider" varchar(255) null, "oauth_profile_id" varchar(255) null);'
    )
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");')

    this.addSql(
      'create table "organization" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "name" varchar(255) not null, "billing_email" varchar(255) not null, "billing_email_verified" bool not null default false, "owner_id" int4 not null);'
    )
    this.addSql('alter table "organization" add constraint "organization_billing_email_unique" unique ("billing_email");')

    this.addSql(
      'alter table "organization" add constraint "organization_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade;'
    )
  }
}
