module.exports = {
	mailuser: "cldev",
	mailpass: "a2:c2:c7:85:77:34",
    url: "mongodb://localhost/CleanConnectDev",
    secretOrKey: '78:5f:4d:4e:a8:6a'
};
//secret generator:dd if=/dev/random bs=2 count=3 2>/dev/null | perl -e '$hex = <>; $hex = unpack("H*", $hex) ; $hex =~ s/(..)(?!.?$)/$1:/g; print "$hex\n";'