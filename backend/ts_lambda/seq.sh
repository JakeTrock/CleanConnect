node_modules/.bin/sequelize init --force && node_modules/.bin/sequelize model:create --name Comment --attributes \"tag:UUID\",\"img:STRING\",\"text:STRING\",\"sev:INTEGER\",\"markedForDeletion:BOOLEAN\",\"removedAt:DATE\",\"ip:STRING\",\"updatedAt:DATE\",\"createdAt:DATE\"
node_modules/.bin/sequelize model:create --name Inventory --attributes \"user:UUID\",\"qrcode:STRING\",\"name:STRING\",\"status:INTEGER\",\"items:UUID\",\"updatedAt:DATE\",\"createdAt:DATE\"
node_modules/.bin/sequelize model:create --name Item --attributes \"inventory:UUID\",\"name:STRING\",\"maxQuant:INTEGER\",\"minQuant:INTEGER\",\"curQuant:INTEGER\",\"markedForDeletion:BOOLEAN\",\"removedAt:DATE\",\"ip:STRING\",\"updatedAt:DATE\",\"createdAt:DATE\"
node_modules/.bin/sequelize model:create --name Tag --attributes \"user:UUID\",\"qrcode:STRING\",\"comments:UUID\",\"name:STRING\",\"updatedAt:DATE\",\"createdAt:DATE\"
node_modules/.bin/sequelize model:create --name User --attributes \"name:STRING\",\"email:STRING\",\"password:STRING\",\"dashurl:STRING\",\"dashCode:STRING\",\"payToken:STRING\",\"custID:STRING\",\"phone:STRING\",\"tags:UUID\",\"invs:UUID\",\"isVerified:BOOLEAN\",\"tier:BOOLEAN\",\"updatedAt:DATE\",\"createdAt:DATE\"
node_modules/.bin/sequelize model:create --name UserIndex --attributes \"userID:UUID\",\"email:STRING\",\"token:STRING\",\"isCritical:BOOLEAN\",\"updatedAt:DATE\",\"createdAt:DATE\"
