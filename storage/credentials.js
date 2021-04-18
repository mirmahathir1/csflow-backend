exports.credentials = {
    type: process.env.STORAGE_TYPE,
    project_id: process.env.STORAGE_PROJECT_ID,
    private_key_id: process.env.STORAGE_PRIVATE_KEY_ID,
    private_key: process.env.STORAGE_PRIVATE_KEY,
    client_email: process.env.STORAGE_CLIENT_EMAIL,
    client_id: process.env.STORAGE_CLIENT_ID,
    auth_uri: process.env.STORAGE_AUTH_URI,
    token_uri: process.env.STORAGE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.STORAGE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.STORAGE_CLIENT_X509_CERT_URL,
};


// console.log(credentials)
// let credentails = fs.readFileSync(path.join(__dirname, "..", "config", "csflow-buet-117f9b557ef8.json"));
// credentails= JSON.parse(credentails);
//
// // console.log(credentails)
//
// for (let key in credentails){
//     console.log(`STORAGE_${key.toUpperCase()}=${credentails[key]}`);
// }
//
// console.log()
// for (let key in credentails){
//     console.log(`${key}: process.env.STORAGE_${key.toUpperCase()},`);
// }
//
// process.exit(0)