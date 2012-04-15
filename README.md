# 0xf8c3b00k

A Facebook client for hackers.

0xf8c3b00k (0xfb) is a command line based facebok client. It enables a command
line only computer to access facebook.

0xfb is built on the top of nodejs, with some additional node modules. User can
access facebook on command line environment, login into facebook uses login
information that already existed in other computer, smartphone. After login,
user can read post, post text to wall (or friend's wall) or post photo.

0xfb takes adventage of shell command, you can post many photos in a single
command. It also reads photo data from standard input, so power of Unix
pipeline can be used in 0xfb. Image data that processed by ImageMagick can be 
forward to 0xfb and uploaded to facebook directly:

    $ convert Picture.jpg -resize 500x500\> jpeg:- | 0xfb post -
    
It's simple, clear and powerful, so just try it. Or leave message on our
[facebook page](https://www.facebook.com/0xf8c3b00kCommunity).
