module.exports = {
    url: "mongodb://localhost/flipit",
    secretOrKey: '78:5f:4d:4e:a8:6a'
};
//secret generator:dd if=/dev/random bs=2 count=3 2>/dev/null | perl -e '$hex = <>; $hex = unpack("H*", $hex) ; $hex =~ s/(..)(?!.?$)/$1:/g; print "$hex\n";'