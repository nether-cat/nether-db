import fs from 'fs';
import path from 'path';

const schemaFile = path.resolve(__dirname, 'schema.graphql');
const schemaString = fs.readFileSync(schemaFile, 'utf8');

export default schemaString;
