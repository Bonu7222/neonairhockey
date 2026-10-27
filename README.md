# neon air hockey 

built this because i wanted a local multiplayer game that feels fast, agressive, and satisfying to play with a friend on the same keyboard. its just two paddles, one puck, and a lot of neon lights. first to 7 wins.

## features

-- canvas physics: the puck bounces off walls and paddles. it uses anngle calculations based on where the puck hits the paddle, so u can actually aim your shots. hit it with the edge to angle it sharply, or hit it dead center to send it strainght.
--synth audio: used the web audio api. hitting the puck makes a square wave sound, and scoring plays a little arpeggio. the faster the puck moves the higher the pitch gets. 
-- the juice: screen shake when a paddle hits the puck or when smn scores. the puck leaves a glowing trail, and hitting it spawns neon particles.
--speed limits: the puck starts at a manageable speed and slowly accelerates with every hit, but its capped so it doesnt turn into an unplayable pinball machine. 
-- win state: clean UI overlay that shows who won the match and lets you restar instantly.

## how to play

open index.html in ur browser and click start match.

## what i learned.

-- collision angles: reflecting the puck off the paddles is easy but making i bounce based on where it hits the paddle is math. i had to calculate the his position relative to the center of the paddles and use math.cos and math.sin to figure out the new trajectory.
-- tweaking speeds: originally the puck was way too fast. it felt like a bullet. ihad to lower the starting speed and slow down the accelaration rate to make it actually playable. playtesting is everything.
-- drawing rounded rects: ctx.roundRect() is super useful but i had to make sure the paddle dimensions were correct so it didnt break on different screen sizes.
-- trail logic: pushing the puck's coordinates into an array every frame and fading them out makes the puck look like its moving 10x faster than it actually is. visual tricks are fun.

overall it supper snappy and really fun to play. nothing beats (a jet 2 holiday) the feeling of scoring a goal right past ur friend 