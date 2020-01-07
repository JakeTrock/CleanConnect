var isTesting = true;
if (isTesting)
    module.exports = {
        testing: true,
        mailServer: 'smtp.ethereal.email',
        mailPort: 587,
        mailUser: 'lilian.bernhard@ethereal.email',
        mailPass: 'fCc7CKMVv1VvuvrsaR',
        url: "mongodb://localhost/CleanConnectDev",
        secretOrKey: '78:5f:4d:4e:a8:6a'
    };
else
    module.exports = {
        testing: false,
        mailServer: '',
        mailPort: 587,
        mailUser: '',
        mailPass: '',
        url: "mongodb://localhost/CleanConnectProd",
        secretOrKey: 'c9:4b:ed:35:ed:9d'
    };
//secret generator:dd if=/dev/random bs=2 count=3 2>/dev/null | perl -e '$hex = <>; $hex = unpack("H*", $hex) ; $hex =~ s/(..)(?!.?$)/$1:/g; print "$hex\n";'