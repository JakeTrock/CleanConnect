var isTesting=true;
if(isTesting)
module.exports = {
    testing:true,
	mailuser: "cldev",
	mailpass: "temppass",
    url: "mongodb://localhost/CleanConnectDev",
    secretOrKey: '78:5f:4d:4e:a8:6a'
};
else
module.exports = {
    testing:false,
	mailuser: "cldev",
	mailpass: "temppass",
    url: "mongodb://localhost/CleanConnectProd",
    secretOrKey: 'c9:4b:ed:35:ed:9d'
};
//secret generator:dd if=/dev/random bs=2 count=3 2>/dev/null | perl -e '$hex = <>; $hex = unpack("H*", $hex) ; $hex =~ s/(..)(?!.?$)/$1:/g; print "$hex\n";'