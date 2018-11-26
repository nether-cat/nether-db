import fs from 'fs';
import path from 'path';

export default fs.readFileSync(path.resolve(__dirname, './schema.graphqls'), { encoding: 'utf8' });
