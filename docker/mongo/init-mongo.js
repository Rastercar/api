/*
 | Creates a dummy user to force database creation
 | 
 | see: https://stackoverflow.com/questions/42912755/how-to-create-a-db-for-mongodb-container-on-start-up
 */
db.createUser({
  user: 'dummy-user',
  pwd: 'dummy-password',
  roles: [{ role: 'read', db: 'rastercar' }]
})
