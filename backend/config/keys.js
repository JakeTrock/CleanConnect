module.exports = {
    testing: true,
    url: "mongodb://localhost/CleanConnectDev",
    mid: "m2jfqj6kzbv9fjn3",
    pbk: "vvn3gp9tctxntj3w",
    prk: "d97c664a90d9bacc02eeec7af7dd630b",
    secretOrKey: '78:5f:4d:4e:a8:6a',
    tierID: ["b5rr", "j4xw", "r452"],
    tagCeilings: [1, 10, 100],
    invCeilings: [1, 10, 100]
};
//secret generator:dd if=/dev/random bs=2 count=3 2>/dev/null | perl -e '$hex = <>; $hex = unpack("H*", $hex) ; $hex =~ s/(..)(?!.?$)/$1:/g; print "$hex\n";'