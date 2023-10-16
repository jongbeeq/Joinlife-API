const multer = require('multer');

const storage = multer.diskStorage(
    {
        detination: (req, file, cb) => {
            // console.log(file)
            cb(null, 'public')
        },
        filename: (req, file, cb) => {
            // console.log(file)
            const split = file.originalname.split('.')
            cb(null, Date.now() + Math.round(Math.random() * 1000000) + '.' + split[split.length - 1])
        }
    }
)

const upload = multer({ storage: storage });
module.exports = upload