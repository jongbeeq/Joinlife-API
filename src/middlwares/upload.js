const multer = require('multer')

const storage = multer.diskStorage(
    {
        detination: (req, file, cb) => {
            cb(null, 'publicaa')
        },
        filename: (req, file, cb) => {
            // console.log(file)
            const split = file.originalname.split('.')
            cb(null, Date.now() + Math.round(Math.random() * 1000000) + '.' + split[split.length - 1])
            // cb(null, Date.now() + file.originalname)
        }
    }
)

const upload = multer({ storage: storage });
module.exports = upload