---
title: "Pico 8: Snake"
date: 2019-08-09T10:28:46+02:00
draft: false
---

[Pico 8](https://www.lexaloffle.com/pico-8.php) is a fantasy console allowing you to create and share games easily ([this video is a great trailer](https://www.youtube.com/watch?v=K5RXMuH54iw&t)).

I have not developed many video games as a student thus I wanted to start with something small to try Pico 8. Snake is a relatively simple game in its mechanics:

- The user (i.e. the snake) is limited to a map that fits in one screen.
- The user can only go up/down/right/left.
- The user tries to get a randomly placed item without touching the borders of the map nor its body.
- When touching the item, the snake length and the score increase by 1.
- The user moves like a snake, its entire body does not change direction when moving but only the head of the snake.

With only 5 constraints, we have defined the game. Let's see how this is gonna look (if you use an AZERTY keyboard, you have to press N to play again):

<p align="center">
    <iframe src="https://www.lexaloffle.com/bbs/widget.php?pid=snake-1" allowfullscreen width="621" height="513" style="border:none; overflow:hidden"></iframe>
</p>

The design is rough, the map is too big, but it works. You can access the entire game's code by opening it on [lexaloffle.com](https://www.lexaloffle.com/bbs/cart_info.php?cid=snake-1) and clicking on `Code`. I have commented most of the code so that it's easy to follow what's happening.

I faced some interesting discoveries and challenges while developing the game, those were the main ones:

# Pico's Model–View–Controller architectural pattern

I'm not a game developer but starting a game on Pico 8 looks familiar:

```
function _init()
end

function _update()
end

function _draw()
end
```

You initialize a model (e.g. a score) in `_init()`, you check and update the status of the game in `_update()`, you draw everything in `_draw()`. A model, a controller, and a view. Pico 8 defines [a few functions](https://www.lexaloffle.com/pico-8.php?page=manual) allowing you to have a first draft with just the borders and the score very easily:

```
function _init()
	-- the borders, pico's screen is 128*128
	x_min=1
	y_min=13
	x_max=126
	y_max=126

    score = 0
end

function _update()
end

function draw()
	cls()

	-- print map and score
	color(7)
	line(x_min, y_min, x_max, y_min)
	line(x_min, y_max, x_max, y_max)
	line(x_min, y_min, x_min, y_max)
	line(x_max, y_min, x_max, y_max)

	print("score:", x_min, 5)
	print(score, 25, 5)
end
```

# Moving a snake

One of the challenges of Snake is that the snake's body does not move all at once. When you press up while going right, the head of the snake will start going up but the rest of the body will keep going right until it reaches the position where you asked the body to go up.

I have thus decided to represent each part of the snake's body as an integer in an array. For example, if you have a snake made of 3 body parts (a head `>`, a body `=`, and a tail `~`) all going to the right (`~=>`), its representation as an array will be `{1, 1, 1}`. If the snake is all going left, `<=~`, its representation as an array will be `{0, 0, 0}`.

This allows to not have to keep the position of each body element but to compute it at runtime by only having the position of the head and then computing the rest of the body depending on where each body part is currently going.

Let's see the controller to have a snake that "moves":

```
function _update()
	if (btnp(0) or btnp(1) or btnp(2) or btnp(3)) then
		if (btnp(0)and snake[#snake]!=1) then
			add(snake, 0)
		elseif (btnp(1) and snake[#snake]!=0) then
			add(snake, 1)
		elseif (btnp(2) and snake[#snake]!=3) then
			add(snake, 2)
		elseif (btnp(3) and snake[#snake]!=2) then
			add(snake, 3)
		else
			add(snake, snake[#snake])
		end
    end
    del(snake, snake[1])
end
```

`btnp()` allows you to know if a button has been pressed, the values `0`, `1`, `2`, and `3` representing the arrow keys. With this mechanism in my controller I am able to update the position of the snake by adding an element at the end of the array (the new position of the head) and deleting the first element of the array (the old position of the tail). The `if` conditions are here to make sure that I cannot directly go in the opposite direction.

The good thing with this logic is that it scales well when the snake grows: if the snake has to grow in the frame I just have to not do the `del(snake, snake[1])` by adding a condition around the line checking for a certain status (check the final code to see how it works). The array will then be one item bigger thus the snake too.

To print the snake (with each body part being 4px * 4px), we need to know what are the coordinates of its head `head_x` and `head_y` and have the positions in an array `snake`, we can then do:

```
x = head_x
y = head_y

-- the tongue
if (snake[#snake]==0) rectfill(x-3, y-1, x-4, y, 8)
if (snake[#snake]==1) rectfill(x+2, y-1, x+3, y, 8)
if (snake[#snake]==2) rectfill(x-1, y-4, x, y-3, 8)
if (snake[#snake]==3) rectfill(x-1, y+2, x, y+3, 8)

-- the body
for i=(#snake),1,-1 do
    rectfill(x-2, y-2, x+1, y+1, 3)
    if (snake[i]==0) x+=4
    if (snake[i]==1) x-=4
    if (snake[i]==2) y+=4
    if (snake[i]==3) y-=4
end
```

# Too fast, too furious

The snake was moving too fast when updating its position each frame (thus 30 times per second). To lower the speed of the snake, I had to lower how often the game was updated. To do this without making the game unresponsive to user input, I have adopted this strategy:

```
function _init()
    speed = 4
 	tick = 1
end

function _update()
	-- refresh frame or action from the player
	if (tick==speed or btnp(0) or btnp(1) or btnp(2) or btnp(3)) then
        -- do things in the controller
        draw()
        tick=1
	else
		tick+=1
	end
end

function draw()
    -- do things
end
```

I have removed the `_draw()` and manually call a function called `draw()` at the end of my controller so that I control the speed of the game. Due to the speed and the tick I am now running the controller only once every 4 frames except if the player presses an input. That way the snake goes slower while still being responsive when the user wants to change its position.

Small detail: by using `btnp()` instead of `btn()` in the controller, I don't make it possible to make the game faster by keeping a finger on one specific arrow of the keyboard.

# Random flower creation

The flower is the item that the snake needs to hit in order to grow. I faced two challenges while adding this to the game as the flower is a sprite, not an object drawn in `draw()`, and that its position should be random but not too much as it shouldn't be where the snake is. To do this, I generate the flower's coordinates in a function called `random_flower(snake_x, snake_y)`.

```
-- set the coordinate of the flower so that it
-- is random and does not touch the snake
function random_flower(snake_x, snake_y)
	-- the values are chosen so that the flower stays in the map
	flower_x=flr(rnd(120))
	flower_x=flower_x-(flower_x%4)
	flower_y=flr(rnd(109)) + 12
	flower_y=flower_y-(flower_y%4)

	for i, x in pairs(snake_x) do
		-- the '-4' are due to the size of the sprite
		if ((x-4)==flower_x and (snake_y[i]-4)==flower_y) then
			-- I hit the snake thus I have to get another flower
			random_flower(snake_x, snake_y)
		end
	end
end
```

`snake_x` and `snake_y` are two arrays representing the current Xs and Ys of the snake. This is not great as I do not need that to represent the snake when drawing it but it makes it easier to check if the generated flower is hitting a snake or not. In that case, we call the function again to generate a new position for the flower. Regarding the random position of the flower, we have to deal with the fact that the snake is 4 pixels thick using `-(flower_x%4)`.

# Conclusion

Making a video game on Pico 8 in a few hours was quite exhilirating! It is easy to start and the programming challenges faced are different compared to the ones I face at work. This article does not cover the entirety of the game, check the [code](https://www.lexaloffle.com/bbs/cart_info.php?cid=snake-1) to see how I've done things like the RIP screen or the hitboxes handling. If you have any questions, just ping me on Twitter.

[@ArmandGrillet](https://twitter.com/ArmandGrillet)
