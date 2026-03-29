/**
 * Fill In the Blink — Pure game engine (no DOM dependencies).
 * Exports: window.BlinkEngine
 *
 * All game logic lives here: word list, difficulty progression,
 * word selection, guess checking, keyboard management, and session
 * state. The UI layer consumes this engine and handles rendering.
 */
var BlinkEngine = (function () {
  'use strict';

  // ===================== Constants =====================

  var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  var ROUND_DURATION = 120; // seconds (2 minutes)

  var CORRECT_PAUSE = 1500;    // ms — animation plays, clock keeps running
  var WRONG_PAUSE = 1500;      // ms — wrong animation plays, clock keeps running
  var KEY_REMOVE_DELAY = 500;  // ms — delay before keys animate out

  // ===================== Word List =====================

  var WORDS = [
    // ---- Grade 2 (~70 words) ----
    { word: 'brave', def: 'not afraid of danger', grade: 2 },
    { word: 'angry', def: 'feeling mad or upset', grade: 2 },
    { word: 'climb', def: 'to move upward using hands and feet', grade: 2 },
    { word: 'quiet', def: 'making very little noise', grade: 2 },
    { word: 'shiny', def: 'bright and reflecting light', grade: 2 },
    { word: 'float', def: 'to rest on top of water', grade: 2 },
    { word: 'globe', def: 'a round model of the earth', grade: 2 },
    { word: 'proud', def: 'feeling good about what you did', grade: 2 },
    { word: 'storm', def: 'bad weather with wind and rain', grade: 2 },
    { word: 'trade', def: 'to give something and get something back', grade: 2 },
    { word: 'sneak', def: 'to move quietly so no one notices', grade: 2 },
    { word: 'growl', def: 'a low angry sound an animal makes', grade: 2 },
    { word: 'feast', def: 'a large meal for many people', grade: 2 },
    { word: 'chase', def: 'to run after someone or something', grade: 2 },
    { word: 'bloom', def: 'when a flower opens its petals', grade: 2 },
    { word: 'crisp', def: 'firm and crunchy when you bite it', grade: 2 },
    { word: 'drift', def: 'to move slowly without trying', grade: 2 },
    { word: 'fresh', def: 'new and not old or spoiled', grade: 2 },
    { word: 'grain', def: 'a tiny seed from wheat or rice', grade: 2 },
    { word: 'honey', def: 'sweet sticky food made by bees', grade: 2 },
    { word: 'jolly', def: 'happy and full of fun', grade: 2 },
    { word: 'knock', def: 'to hit a door with your hand', grade: 2 },
    { word: 'lucky', def: 'having good things happen by chance', grade: 2 },
    { word: 'minus', def: 'to take away one number from another', grade: 2 },
    { word: 'peace', def: 'a time with no fighting or war', grade: 2 },
    { word: 'rapid', def: 'moving or happening very fast', grade: 2 },
    { word: 'scarf', def: 'cloth worn around the neck for warmth', grade: 2 },
    { word: 'thumb', def: 'the short thick finger on your hand', grade: 2 },
    { word: 'upset', def: 'feeling sad or worried about something', grade: 2 },
    { word: 'value', def: 'how much something is worth', grade: 2 },
    { word: 'whale', def: 'a very large animal that lives in the ocean', grade: 2 },
    { word: 'youth', def: 'the time when you are young', grade: 2 },
    { word: 'zebra', def: 'a striped animal that looks like a horse', grade: 2 },
    { word: 'beach', def: 'sandy ground next to the ocean', grade: 2 },
    { word: 'cabin', def: 'a small wooden house in the woods', grade: 2 },
    { word: 'dance', def: 'to move your body to music', grade: 2 },
    { word: 'earth', def: 'the planet where we all live', grade: 2 },
    { word: 'flame', def: 'the hot bright part of a fire', grade: 2 },
    { word: 'giant', def: 'something much bigger than normal', grade: 2 },
    { word: 'heart', def: 'the part of your body that pumps blood', grade: 2 },
    { word: 'insect', def: 'a small bug with six legs', grade: 2 },
    { word: 'juice', def: 'liquid that comes from fruit', grade: 2 },
    { word: 'koala', def: 'a furry animal that lives in trees', grade: 2 },
    { word: 'lemon', def: 'a sour yellow fruit', grade: 2 },
    { word: 'moist', def: 'a little bit wet or damp', grade: 2 },
    { word: 'nurse', def: 'a person who helps sick people get better', grade: 2 },
    { word: 'ocean', def: 'a very large body of salt water', grade: 2 },
    { word: 'paste', def: 'a thick sticky mixture for gluing', grade: 2 },
    { word: 'ranch', def: 'a large farm with animals', grade: 2 },
    { word: 'silly', def: 'funny in a playful or goofy way', grade: 2 },
    { word: 'train', def: 'a line of cars that rides on tracks', grade: 2 },
    { word: 'uncle', def: 'your parent\'s brother', grade: 2 },
    { word: 'voice', def: 'the sound you make when you talk', grade: 2 },
    { word: 'weird', def: 'strange or very different from normal', grade: 2 },
    { word: 'alarm', def: 'a loud sound that warns of danger', grade: 2 },
    { word: 'brush', def: 'a tool with bristles for cleaning or painting', grade: 2 },
    { word: 'creek', def: 'a small stream of flowing water', grade: 2 },
    { word: 'empty', def: 'having nothing inside', grade: 2 },
    { word: 'flock', def: 'a group of birds together', grade: 2 },
    { word: 'grill', def: 'to cook food over a fire', grade: 2 },
    { word: 'hover', def: 'to stay in the air in one place', grade: 2 },
    { word: 'ledge', def: 'a narrow flat surface that sticks out', grade: 2 },
    { word: 'moose', def: 'a very large deer with big antlers', grade: 2 },
    { word: 'patch', def: 'a small piece used to cover a hole', grade: 2 },
    { word: 'spray', def: 'to send tiny drops of liquid through air', grade: 2 },
    { word: 'tower', def: 'a tall narrow building or structure', grade: 2 },
    { word: 'wagon', def: 'a cart with four wheels pulled along', grade: 2 },
    { word: 'crust', def: 'the hard outer layer of bread', grade: 2 },
    { word: 'shelf', def: 'a flat board for holding things on a wall', grade: 2 },
    { word: 'stump', def: 'the short part left after a tree is cut', grade: 2 },
    { word: 'braid', def: 'to weave three pieces together', grade: 2 },
    { word: 'chalk', def: 'a soft white stick used for writing', grade: 2 },
    { word: 'cloud', def: 'a white or gray shape in the sky', grade: 2 },
    { word: 'crane', def: 'a big machine that lifts heavy things', grade: 2 },
    { word: 'dusty', def: 'covered with tiny bits of dirt', grade: 2 },
    { word: 'eagle', def: 'a large bird with strong wings', grade: 2 },
    { word: 'fairy', def: 'a tiny person with wings in stories', grade: 2 },
    { word: 'grasp', def: 'to hold something tightly', grade: 2 },
    { word: 'haste', def: 'doing things very quickly', grade: 2 },
    { word: 'igloo', def: 'a house made of blocks of snow', grade: 2 },
    { word: 'jelly', def: 'a soft wiggly food made from fruit', grade: 2 },
    { word: 'leash', def: 'a strap to hold a pet while walking', grade: 2 },
    { word: 'maple', def: 'a tree with leaves that turn red', grade: 2 },
    { word: 'oasis', def: 'a green spot with water in a desert', grade: 2 },
    { word: 'pearl', def: 'a small round gem found in a shell', grade: 2 },
    { word: 'plant', def: 'a living thing that grows in soil', grade: 2 },
    { word: 'prize', def: 'something you win in a contest', grade: 2 },
    { word: 'ridge', def: 'the long narrow top of a hill', grade: 2 },
    { word: 'robin', def: 'a bird with a red chest', grade: 2 },
    { word: 'scale', def: 'a tool used to weigh things', grade: 2 },
    { word: 'skate', def: 'to glide on ice or wheels', grade: 2 },
    { word: 'slope', def: 'ground that goes up or down at an angle', grade: 2 },
    { word: 'smart', def: 'able to learn and think quickly', grade: 2 },
    { word: 'spike', def: 'a sharp pointed piece of metal', grade: 2 },
    { word: 'stamp', def: 'a small sticker put on a letter', grade: 2 },
    { word: 'straw', def: 'a thin tube for drinking', grade: 2 },
    { word: 'swing', def: 'a seat that moves back and forth', grade: 2 },
    { word: 'thorn', def: 'a sharp point on a plant stem', grade: 2 },
    { word: 'trail', def: 'a path through the woods', grade: 2 },
    { word: 'trunk', def: 'the thick main part of a tree', grade: 2 },
    { word: 'visor', def: 'a part of a hat that shades your eyes', grade: 2 },
    { word: 'orbit', def: 'the path something takes around a star', grade: 2 },
    { word: 'pouch', def: 'a small bag for carrying things', grade: 2 },
    { word: 'arrow', def: 'a pointed stick shot from a bow', grade: 2 },
    { word: 'badge', def: 'a small pin that shows who you are', grade: 2 },
    { word: 'bench', def: 'a long seat for two or more people', grade: 2 },
    { word: 'blade', def: 'the sharp cutting part of a knife', grade: 2 },
    { word: 'blaze', def: 'a bright burning fire', grade: 2 },
    { word: 'blend', def: 'to mix things together smoothly', grade: 2 },
    { word: 'brick', def: 'a block used to build walls', grade: 2 },
    { word: 'brook', def: 'a small stream of water', grade: 2 },
    { word: 'candy', def: 'a sweet treat made with sugar', grade: 2 },
    { word: 'cargo', def: 'goods carried by a truck or ship', grade: 2 },
    { word: 'charm', def: 'a quality that makes you likable', grade: 2 },
    { word: 'cheek', def: 'the soft side of your face', grade: 2 },
    { word: 'cliff', def: 'a steep rocky wall of land', grade: 2 },
    { word: 'cloth', def: 'fabric used to make clothes', grade: 2 },
    { word: 'coach', def: 'a person who teaches a sport', grade: 2 },
    { word: 'coral', def: 'a hard colorful thing in the ocean', grade: 2 },
    { word: 'cozy', def: 'warm and comfortable', grade: 2 },
    { word: 'daisy', def: 'a white flower with a yellow center', grade: 2 },
    { word: 'decoy', def: 'something used to trick or distract', grade: 2 },
    { word: 'ditch', def: 'a long narrow hole dug in the ground', grade: 2 },
    { word: 'dizzy', def: 'feeling like everything is spinning', grade: 2 },
    { word: 'dodge', def: 'to move quickly to avoid something', grade: 2 },
    { word: 'dough', def: 'a soft mix used to make bread', grade: 2 },
    { word: 'drape', def: 'to hang cloth loosely over something', grade: 2 },
    { word: 'dwarf', def: 'a very small person in fairy tales', grade: 2 },
    { word: 'erase', def: 'to remove marks from paper', grade: 2 },
    { word: 'fetch', def: 'to go get something and bring it back', grade: 2 },
    { word: 'fiber', def: 'a thin thread found in plants or cloth', grade: 2 },
    { word: 'flute', def: 'a musical instrument you blow across', grade: 2 },
    { word: 'forge', def: 'a hot place where metal is shaped', grade: 2 },
    { word: 'frost', def: 'a thin layer of ice on a cold surface', grade: 2 },
    { word: 'gaze', def: 'to look at something for a long time', grade: 2 },
    { word: 'gleam', def: 'a soft bright light that shines', grade: 2 },
    { word: 'goose', def: 'a large bird bigger than a duck', grade: 2 },
    { word: 'grape', def: 'a small round fruit that grows on vines', grade: 2 },
    { word: 'grief', def: 'deep sadness when someone is lost', grade: 2 },
    { word: 'guard', def: 'a person who watches over something', grade: 2 },
    { word: 'habit', def: 'something you do again and again', grade: 2 },
    { word: 'hedge', def: 'a row of bushes used as a fence', grade: 2 },
    { word: 'hippo', def: 'a big animal that lives near rivers', grade: 2 },
    { word: 'hobby', def: 'something fun you like to do often', grade: 2 },
    { word: 'ivory', def: 'a hard white material from tusks', grade: 2 },
    { word: 'kayak', def: 'a small boat you paddle with two ends', grade: 2 },
    { word: 'kneel', def: 'to go down on your knees', grade: 2 },
    { word: 'label', def: 'a tag that tells what something is', grade: 2 },
    { word: 'lever', def: 'a bar used to lift heavy things', grade: 2 },
    { word: 'llama', def: 'a furry animal with a long neck', grade: 2 },
    { word: 'marsh', def: 'soft wet land near water', grade: 2 },
    { word: 'melon', def: 'a large sweet fruit with seeds inside', grade: 2 },
    { word: 'motor', def: 'a machine that makes things move', grade: 2 },
    { word: 'nudge', def: 'a gentle push with your elbow', grade: 2 },
    { word: 'olive', def: 'a small green or black fruit', grade: 2 },
    { word: 'organ', def: 'a part inside your body that does a job', grade: 2 },
    { word: 'otter', def: 'a playful furry animal that swims', grade: 2 },
    { word: 'pixel', def: 'a tiny dot of color on a screen', grade: 2 },
    { word: 'peach', def: 'a soft fuzzy fruit with a pit', grade: 2 },
    { word: 'pedal', def: 'a part you push with your foot', grade: 2 },
    { word: 'perch', def: 'a branch where a bird sits', grade: 2 },
    { word: 'plank', def: 'a long flat piece of wood', grade: 2 },
    { word: 'pluck', def: 'to pull something off quickly', grade: 2 },
    { word: 'polar', def: 'having to do with the cold poles', grade: 2 },
    { word: 'prank', def: 'a playful trick on someone', grade: 2 },
    { word: 'quail', def: 'a small round bird', grade: 2 },
    { word: 'ramp', def: 'a slope that connects two levels', grade: 2 },
    { word: 'ripen', def: 'to become ready to eat', grade: 2 },
    { word: 'rover', def: 'a person or machine that wanders', grade: 2 },
    { word: 'scene', def: 'a part of a story or play', grade: 2 },
    { word: 'scoop', def: 'to pick something up with a spoon', grade: 2 },
    { word: 'shark', def: 'a large fish with sharp teeth', grade: 2 },
    { word: 'shrub', def: 'a small bushy plant', grade: 2 },
    { word: 'skunk', def: 'a black and white animal with a bad smell', grade: 2 },
    { word: 'sleek', def: 'smooth and shiny', grade: 2 },
    { word: 'slime', def: 'a thick slippery liquid', grade: 2 },
    { word: 'snore', def: 'to breathe loudly while sleeping', grade: 2 },
    { word: 'solar', def: 'having to do with the sun', grade: 2 },
    { word: 'spice', def: 'a powder used to add flavor to food', grade: 2 },
    { word: 'spill', def: 'to let liquid fall out by accident', grade: 2 },
    { word: 'stain', def: 'a dirty mark that is hard to remove', grade: 2 },
    { word: 'stare', def: 'to look at something without blinking', grade: 2 },
    { word: 'steer', def: 'to control which way something goes', grade: 2 },
    { word: 'stool', def: 'a seat with no back', grade: 2 },
    { word: 'strip', def: 'a long narrow piece of something', grade: 2 },
    { word: 'sweep', def: 'to clean the floor with a broom', grade: 2 },
    { word: 'thief', def: 'a person who steals things', grade: 2 },
    { word: 'toast', def: 'bread that is browned by heat', grade: 2 },
    { word: 'trout', def: 'a fish that lives in streams', grade: 2 },
    { word: 'tulip', def: 'a cup-shaped flower that blooms in spring', grade: 2 },
    { word: 'twirl', def: 'to spin around quickly', grade: 2 },
    { word: 'vault', def: 'a strong room for keeping valuables safe', grade: 2 },
    { word: 'venom', def: 'poison made by snakes or spiders', grade: 2 },
    { word: 'waist', def: 'the narrow middle part of your body', grade: 2 },
    { word: 'wheat', def: 'a grain used to make bread and flour', grade: 2 },
    { word: 'wreck', def: 'something that has been badly damaged', grade: 2 },
    { word: 'yacht', def: 'a large boat used for sailing', grade: 2 },
    { word: 'yield', def: 'to give way or let someone go first', grade: 2 },
    { word: 'cider', def: 'a drink made from apples', grade: 2 },
    { word: 'denim', def: 'a strong blue cloth used to make jeans', grade: 2 },

    // ---- Grade 3 (~200 words) ----
    { word: 'ancient', def: 'very old, from long ago', grade: 3 },
    { word: 'balance', def: 'to keep steady without falling over', grade: 3 },
    { word: 'captain', def: 'the leader of a team or ship', grade: 3 },
    { word: 'destroy', def: 'to break something completely apart', grade: 3 },
    { word: 'explore', def: 'to travel to learn about new places', grade: 3 },
    { word: 'fragile', def: 'easy to break or damage', grade: 3 },
    { word: 'harvest', def: 'to gather crops when they are ready', grade: 3 },
    { word: 'imagine', def: 'to make a picture in your mind', grade: 3 },
    { word: 'journey', def: 'a long trip from one place to another', grade: 3 },
    { word: 'kingdom', def: 'a land ruled by a king or queen', grade: 3 },
    { word: 'lantern', def: 'a lamp you can carry with you', grade: 3 },
    { word: 'measure', def: 'to find the size or amount of something', grade: 3 },
    { word: 'natural', def: 'made by nature, not by people', grade: 3 },
    { word: 'observe', def: 'to watch something carefully', grade: 3 },
    { word: 'pattern', def: 'a design that repeats over and over', grade: 3 },
    { word: 'quicken', def: 'to make something go faster', grade: 3 },
    { word: 'require', def: 'to need something in order to succeed', grade: 3 },
    { word: 'scatter', def: 'to throw things in many directions', grade: 3 },
    { word: 'tremble', def: 'to shake because of fear or cold', grade: 3 },
    { word: 'unusual', def: 'not common or not seen very often', grade: 3 },
    { word: 'village', def: 'a small town in the countryside', grade: 3 },
    { word: 'whisper', def: 'to speak very softly and quietly', grade: 3 },
    { word: 'acquire', def: 'to get or gain something new', grade: 3 },
    { word: 'breathe', def: 'to take air in and out of your lungs', grade: 3 },
    { word: 'climate', def: 'the usual weather in a place over time', grade: 3 },
    { word: 'display', def: 'to show something for others to see', grade: 3 },
    { word: 'emotion', def: 'a strong feeling like joy or sadness', grade: 3 },
    { word: 'fiction', def: 'a story that is made up and not real', grade: 3 },
    { word: 'genuine', def: 'real and not fake or copied', grade: 3 },
    { word: 'horizon', def: 'the line where the sky meets the land', grade: 3 },
    { word: 'initial', def: 'happening at the very beginning', grade: 3 },
    { word: 'justice', def: 'fair treatment for all people', grade: 3 },
    { word: 'lecture', def: 'a talk given to teach a group', grade: 3 },
    { word: 'mineral', def: 'a natural solid found in the earth', grade: 3 },
    { word: 'nucleus', def: 'the center part of a cell or atom', grade: 3 },
    { word: 'opinion', def: 'what someone thinks about a topic', grade: 3 },
    { word: 'passage', def: 'a section of writing from a book', grade: 3 },
    { word: 'revolve', def: 'to spin or move in a circle', grade: 3 },
    { word: 'surface', def: 'the outside or top layer of something', grade: 3 },
    { word: 'trouble', def: 'a problem or difficult situation', grade: 3 },
    { word: 'uniform', def: 'special clothes worn by a group', grade: 3 },
    { word: 'volcano', def: 'a mountain that can erupt with hot lava', grade: 3 },
    { word: 'wander', def: 'to walk around without a clear goal', grade: 3 },
    { word: 'achieve', def: 'to finish something you worked hard on', grade: 3 },
    { word: 'burrow', def: 'a tunnel dug by an animal underground', grade: 3 },
    { word: 'connect', def: 'to join two things together', grade: 3 },
    { word: 'diagram', def: 'a drawing that explains how something works', grade: 3 },
    { word: 'exhibit', def: 'a display of objects for people to see', grade: 3 },
    { word: 'flutter', def: 'to move wings quickly up and down', grade: 3 },
    { word: 'glimpse', def: 'a quick short look at something', grade: 3 },
    { word: 'habitat', def: 'the place where an animal naturally lives', grade: 3 },
    { word: 'inspect', def: 'to look at something very closely', grade: 3 },
    { word: 'journal', def: 'a book for writing your thoughts each day', grade: 3 },
    { word: 'kitchen', def: 'the room where food is cooked', grade: 3 },
    { word: 'machine', def: 'a device built to do a job', grade: 3 },
    { word: 'nectar', def: 'sweet liquid flowers make for bees', grade: 3 },
    { word: 'outline', def: 'a drawing showing only the outer edge', grade: 3 },
    { word: 'predict', def: 'to say what you think will happen next', grade: 3 },
    { word: 'release', def: 'to let something go free', grade: 3 },
    { word: 'shelter', def: 'a place that protects you from weather', grade: 3 },
    { word: 'theater', def: 'a building where plays or movies are shown', grade: 3 },
    { word: 'vibrate', def: 'to shake back and forth very fast', grade: 3 },
    { word: 'wrinkle', def: 'a small fold or crease in something', grade: 3 },
    { word: 'century', def: 'a period of one hundred years', grade: 3 },
    { word: 'dolphin', def: 'a smart ocean animal that breathes air', grade: 3 },
    { word: 'fertile', def: 'good for growing plants and crops', grade: 3 },
    { word: 'migrate', def: 'to move to a new place each season', grade: 3 },
    { word: 'popular', def: 'liked or enjoyed by many people', grade: 3 },
    { word: 'compete', def: 'to try to win against someone else', grade: 3 },
    { word: 'costume', def: 'special clothes worn to look like someone else', grade: 3 },
    { word: 'athlete', def: 'a person who plays sports well', grade: 3 },
    { word: 'bargain', def: 'something you buy at a low price', grade: 3 },
    { word: 'brittle', def: 'hard but easy to snap or break', grade: 3 },
    { word: 'caution', def: 'being very careful to avoid danger', grade: 3 },
    { word: 'chamber', def: 'a room used for a special purpose', grade: 3 },
    { word: 'chimney', def: 'a tube that lets smoke go out of a house', grade: 3 },
    { word: 'circuit', def: 'a path that electricity flows along', grade: 3 },
    { word: 'cluster', def: 'a group of things close together', grade: 3 },
    { word: 'compass', def: 'a tool that shows which way is north', grade: 3 },
    { word: 'current', def: 'the flow of water or electricity', grade: 3 },
    { word: 'declare', def: 'to say something in a strong clear way', grade: 3 },
    { word: 'deposit', def: 'to put money into a bank account', grade: 3 },
    { word: 'devoted', def: 'loving and caring very much', grade: 3 },
    { word: 'eclipse', def: 'when the moon blocks the sun', grade: 3 },
    { word: 'erosion', def: 'when wind or water wears away rock', grade: 3 },
    { word: 'express', def: 'to show your feelings or ideas', grade: 3 },
    { word: 'fantasy', def: 'a story from the imagination', grade: 3 },
    { word: 'furnace', def: 'a machine that heats a building', grade: 3 },
    { word: 'glacier', def: 'a huge slow-moving river of ice', grade: 3 },
    { word: 'grapple', def: 'to struggle or wrestle with something', grade: 3 },
    { word: 'hammock', def: 'a hanging bed made of cloth or rope', grade: 3 },
    { word: 'hollow', def: 'empty on the inside', grade: 3 },
    { word: 'inhabit', def: 'to live in a certain place', grade: 3 },
    { word: 'ivy', def: 'a plant that climbs walls and trees', grade: 3 },
    { word: 'marshal', def: 'a person who keeps order at events', grade: 3 },
    { word: 'nephew', def: 'the son of your brother or sister', grade: 3 },
    { word: 'orchard', def: 'a field where fruit trees grow', grade: 3 },
    { word: 'pasture', def: 'a grassy field where animals eat', grade: 3 },
    { word: 'plumber', def: 'a person who fixes pipes and water systems', grade: 3 },
    { word: 'prairie', def: 'a large flat area of grassland', grade: 3 },
    { word: 'quarrel', def: 'an angry argument between people', grade: 3 },
    { word: 'remnant', def: 'a small piece left over from something', grade: 3 },
    { word: 'absorb', def: 'to soak up liquid like a sponge', grade: 3 },
    { word: 'account', def: 'a report or record of what happened', grade: 3 },
    { word: 'address', def: 'the number and street where you live', grade: 3 },
    { word: 'admiral', def: 'a top leader in the navy', grade: 3 },
    { word: 'adviser', def: 'a person who gives helpful ideas', grade: 3 },
    { word: 'almanac', def: 'a book of facts about the year', grade: 3 },
    { word: 'amateur', def: 'someone who does something for fun not pay', grade: 3 },
    { word: 'antenna', def: 'a rod that picks up radio signals', grade: 3 },
    { word: 'auction', def: 'a sale where people bid to buy things', grade: 3 },
    { word: 'average', def: 'the usual or normal amount', grade: 3 },
    { word: 'awkward', def: 'clumsy or hard to do smoothly', grade: 3 },
    { word: 'balloon', def: 'a bag that floats when filled with air', grade: 3 },
    { word: 'blanket', def: 'a soft cover used to stay warm', grade: 3 },
    { word: 'blossom', def: 'a flower on a tree or plant', grade: 3 },
    { word: 'blunder', def: 'a big careless mistake', grade: 3 },
    { word: 'bonfire', def: 'a large fire built outdoors', grade: 3 },
    { word: 'cabinet', def: 'a piece of furniture with doors and shelves', grade: 3 },
    { word: 'calcium', def: 'a mineral that makes bones strong', grade: 3 },
    { word: 'canteen', def: 'a small container for carrying water', grade: 3 },
    { word: 'catfish', def: 'a fish with whiskers near its mouth', grade: 3 },
    { word: 'catalog', def: 'a list of items you can buy or see', grade: 3 },
    { word: 'channel', def: 'a narrow path of water between land', grade: 3 },
    { word: 'charter', def: 'a written set of rules or rights', grade: 3 },
    { word: 'collide', def: 'to crash into something', grade: 3 },
    { word: 'comfort', def: 'a nice feeling of being relaxed', grade: 3 },
    { word: 'command', def: 'an order telling someone what to do', grade: 3 },
    { word: 'commute', def: 'to travel back and forth to work', grade: 3 },
    { word: 'confirm', def: 'to make sure something is true', grade: 3 },
    { word: 'consent', def: 'to say yes and give permission', grade: 3 },
    { word: 'contain', def: 'to hold something inside', grade: 3 },
    { word: 'contest', def: 'a game or event to see who wins', grade: 3 },
    { word: 'convert', def: 'to change from one form to another', grade: 3 },
    { word: 'council', def: 'a group that makes decisions together', grade: 3 },
    { word: 'courage', def: 'being brave when things are scary', grade: 3 },
    { word: 'cracker', def: 'a thin crispy snack food', grade: 3 },
    { word: 'culture', def: 'the way of life of a group of people', grade: 3 },
    { word: 'curtain', def: 'a piece of cloth hung over a window', grade: 3 },
    { word: 'custom', def: 'a tradition people follow for years', grade: 3 },
    { word: 'dessert', def: 'a sweet food served after a meal', grade: 3 },
    { word: 'develop', def: 'to grow or make something bigger', grade: 3 },
    { word: 'discuss', def: 'to talk about something with others', grade: 3 },
    { word: 'distant', def: 'far away from where you are', grade: 3 },
    { word: 'drought', def: 'a long time with no rain', grade: 3 },
    { word: 'elastic', def: 'able to stretch and spring back', grade: 3 },
    { word: 'elegant', def: 'graceful and pleasing to look at', grade: 3 },
    { word: 'emperor', def: 'the ruler of a large group of lands', grade: 3 },
    { word: 'enforce', def: 'to make sure rules are followed', grade: 3 },
    { word: 'episode', def: 'one part of a series or show', grade: 3 },
    { word: 'eternal', def: 'lasting forever without ending', grade: 3 },
    { word: 'examine', def: 'to look at something very closely', grade: 3 },
    { word: 'extract', def: 'to pull or take something out', grade: 3 },
    { word: 'famine', def: 'a time when many people have no food', grade: 3 },
    { word: 'fashion', def: 'a popular style of clothes or hair', grade: 3 },
    { word: 'festive', def: 'happy and full of celebration', grade: 3 },
    { word: 'fitness', def: 'being healthy and strong from exercise', grade: 3 },
    { word: 'fortune', def: 'a large amount of money or luck', grade: 3 },
    { word: 'founder', def: 'the person who started something', grade: 3 },
    { word: 'gallery', def: 'a room or building for showing art', grade: 3 },
    { word: 'garment', def: 'a piece of clothing you wear', grade: 3 },
    { word: 'gateway', def: 'an opening or entrance to a place', grade: 3 },
    { word: 'gorilla', def: 'a large strong ape that lives in groups', grade: 3 },
    { word: 'granite', def: 'a very hard type of rock', grade: 3 },
    { word: 'gratify', def: 'to make someone feel pleased', grade: 3 },
    { word: 'gravity', def: 'the force that pulls things to the ground', grade: 3 },
    { word: 'harmony', def: 'sounds or people working well together', grade: 3 },
    { word: 'harness', def: 'straps used to hold something in place', grade: 3 },
    { word: 'highway', def: 'a wide main road for fast travel', grade: 3 },
    { word: 'iceberg', def: 'a huge chunk of ice floating in the sea', grade: 3 },
    { word: 'illegal', def: 'not allowed by the law', grade: 3 },
    { word: 'include', def: 'to make something part of a group', grade: 3 },
    { word: 'intense', def: 'very strong or powerful', grade: 3 },
    { word: 'invent', def: 'to create something brand new', grade: 3 },
    { word: 'janitor', def: 'a person who cleans a building', grade: 3 },
    { word: 'javelin', def: 'a long spear thrown in sports', grade: 3 },
    { word: 'leopard', def: 'a big spotted wild cat', grade: 3 },
    { word: 'kennel', def: 'a small shelter for a dog', grade: 3 },
    { word: 'laborer', def: 'a person who does hard physical work', grade: 3 },
    { word: 'laundry', def: 'clothes that need to be washed', grade: 3 },
    { word: 'liberty', def: 'the freedom to do as you choose', grade: 3 },
    { word: 'lottery', def: 'a contest where winners are picked by luck', grade: 3 },
    { word: 'magnify', def: 'to make something look bigger', grade: 3 },
    { word: 'manners', def: 'polite ways of behaving around others', grade: 3 },
    { word: 'monster', def: 'a scary creature in stories', grade: 3 },
    { word: 'mystery', def: 'something that is hard to explain', grade: 3 },
    { word: 'narrate', def: 'to tell a story out loud', grade: 3 },
    { word: 'neutral', def: 'not taking any side in a fight', grade: 3 },
    { word: 'notable', def: 'important and worth paying attention to', grade: 3 },
    { word: 'nourish', def: 'to give food needed to grow strong', grade: 3 },
    { word: 'obvious', def: 'easy to see or understand', grade: 3 },
    { word: 'operate', def: 'to make a machine work', grade: 3 },
    { word: 'outdoor', def: 'happening outside and not inside', grade: 3 },
    { word: 'paddock', def: 'a small fenced area for horses', grade: 3 },
    { word: 'panther', def: 'a big wild cat with dark fur', grade: 3 },
    { word: 'pendant', def: 'a piece of jewelry that hangs from a chain', grade: 3 },
    { word: 'pilgrim', def: 'a person who travels for a holy reason', grade: 3 },
    { word: 'pioneer', def: 'one of the first people to try something', grade: 3 },
    { word: 'plaster', def: 'a paste that hardens on walls', grade: 3 },
    { word: 'popcorn', def: 'a snack made from heated corn kernels', grade: 3 },
    { word: 'produce', def: 'to make or grow something', grade: 3 },

    // ---- Grade 4 (~200 words) ----
    { word: 'abandon', def: 'to leave behind and not return', grade: 4 },
    { word: 'boundary', def: 'a line that marks the edge of an area', grade: 4 },
    { word: 'collapse', def: 'to fall down or break apart suddenly', grade: 4 },
    { word: 'distinct', def: 'clearly different from other things', grade: 4 },
    { word: 'enormous', def: 'extremely large in size', grade: 4 },
    { word: 'flexible', def: 'able to bend easily without breaking', grade: 4 },
    { word: 'generous', def: 'willing to give and share with others', grade: 4 },
    { word: 'hesitate', def: 'to pause before doing something', grade: 4 },
    { word: 'identify', def: 'to figure out what something is', grade: 4 },
    { word: 'juvenile', def: 'young and not fully grown up yet', grade: 4 },
    { word: 'navigate', def: 'to find your way from place to place', grade: 4 },
    { word: 'obstacle', def: 'something that blocks your path', grade: 4 },
    { word: 'preserve', def: 'to keep something safe from harm', grade: 4 },
    { word: 'quantity', def: 'the amount or number of something', grade: 4 },
    { word: 'reliable', def: 'can be trusted to work or help', grade: 4 },
    { word: 'sequence', def: 'things arranged in a specific order', grade: 4 },
    { word: 'treasure', def: 'valuable items like gold or jewels', grade: 4 },
    { word: 'accurate', def: 'correct and free from mistakes', grade: 4 },
    { word: 'bacteria', def: 'tiny living things too small to see', grade: 4 },
    { word: 'conclude', def: 'to finish or come to an end', grade: 4 },
    { word: 'document', def: 'a paper with important information on it', grade: 4 },
    { word: 'estimate', def: 'to make a close guess about a number', grade: 4 },
    { word: 'function', def: 'the purpose or job of something', grade: 4 },
    { word: 'guardian', def: 'a person who protects and cares for another', grade: 4 },
    { word: 'moderate', def: 'not too much and not too little', grade: 4 },
    { word: 'portrait', def: 'a painting or photo of a person', grade: 4 },
    { word: 'opposite', def: 'as different as possible from something', grade: 4 },
    { word: 'reaction', def: 'what you do in response to something', grade: 4 },
    { word: 'solution', def: 'the answer to a problem or puzzle', grade: 4 },
    { word: 'transfer', def: 'to move something from one place to another', grade: 4 },
    { word: 'apparent', def: 'easy to see or understand clearly', grade: 4 },
    { word: 'ceremony', def: 'a formal event for a special occasion', grade: 4 },
    { word: 'dramatic', def: 'exciting and full of strong feeling', grade: 4 },
    { word: 'evaluate', def: 'to judge how good or useful something is', grade: 4 },
    { word: 'fraction', def: 'a part of a whole number like one half', grade: 4 },
    { word: 'ignorant', def: 'not knowing about something important', grade: 4 },
    { word: 'majority', def: 'more than half of a group', grade: 4 },
    { word: 'numerous', def: 'a very large number of things', grade: 4 },
    { word: 'organize', def: 'to put things in a neat and useful order', grade: 4 },
    { word: 'peculiar', def: 'strange or odd in an unusual way', grade: 4 },
    { word: 'resource', def: 'something useful that you can use', grade: 4 },
    { word: 'stampede', def: 'a group of animals running wildly together', grade: 4 },
    { word: 'thorough', def: 'done carefully without missing anything', grade: 4 },
    { word: 'vehicle', def: 'a machine used to carry people or things', grade: 4 },
    { word: 'ancestor', def: 'a family member who lived long ago', grade: 4 },
    { word: 'convince', def: 'to make someone agree with your idea', grade: 4 },
    { word: 'diameter', def: 'the distance straight across a circle', grade: 4 },
    { word: 'exchange', def: 'to give one thing and receive another', grade: 4 },
    { word: 'grateful', def: 'feeling thankful for something nice', grade: 4 },
    { word: 'increase', def: 'to make something larger or greater', grade: 4 },
    { word: 'language', def: 'the words people use to communicate', grade: 4 },
    { word: 'moisture', def: 'tiny drops of water in the air or soil', grade: 4 },
    { word: 'particle', def: 'a very tiny piece of something', grade: 4 },
    { word: 'sentence', def: 'a group of words that states a complete idea', grade: 4 },
    { word: 'ultimate', def: 'the last or most important of all', grade: 4 },
    { word: 'chemical', def: 'a substance made by or used in chemistry', grade: 4 },
    { word: 'evidence', def: 'facts that help prove something is true', grade: 4 },
    { word: 'infinite', def: 'going on forever without any end', grade: 4 },
    { word: 'multiply', def: 'to add a number to itself many times', grade: 4 },
    { word: 'question', def: 'something you ask to get an answer', grade: 4 },
    { word: 'adequate', def: 'enough or good enough for what is needed', grade: 4 },
    { word: 'alliance', def: 'a group of people or countries working together', grade: 4 },
    { word: 'artifact', def: 'an object made by people long ago', grade: 4 },
    { word: 'bankrupt', def: 'having no money left to pay debts', grade: 4 },
    { word: 'campaign', def: 'a plan of actions to reach a goal', grade: 4 },
    { word: 'classify', def: 'to sort things into groups', grade: 4 },
    { word: 'conflict', def: 'a fight or strong disagreement', grade: 4 },
    { word: 'currency', def: 'the money used in a country', grade: 4 },
    { word: 'demolish', def: 'to tear down or destroy completely', grade: 4 },
    { word: 'dialogue', def: 'a conversation between two or more people', grade: 4 },
    { word: 'diligent', def: 'working hard and being careful', grade: 4 },
    { word: 'eloquent', def: 'speaking in a clear and powerful way', grade: 4 },
    { word: 'emphasis', def: 'extra importance given to something', grade: 4 },
    { word: 'escalate', def: 'to become bigger or more serious', grade: 4 },
    { word: 'flammable', def: 'able to catch fire easily', grade: 4 },
    { word: 'folklore', def: 'old stories passed down by people', grade: 4 },
    { word: 'fragment', def: 'a small broken piece of something', grade: 4 },
    { word: 'generate', def: 'to create or produce something', grade: 4 },
    { word: 'glossary', def: 'a list of words and their meanings', grade: 4 },
    { word: 'governor', def: 'the leader of a state', grade: 4 },
    { word: 'heredity', def: 'traits passed from parents to children', grade: 4 },
    { word: 'humidity', def: 'the amount of water in the air', grade: 4 },
    { word: 'illusion', def: 'something that tricks your eyes', grade: 4 },
    { word: 'immense', def: 'very large or huge', grade: 4 },
    { word: 'incident', def: 'something that happens, an event', grade: 4 },
    { word: 'irrigate', def: 'to bring water to dry land for crops', grade: 4 },
    { word: 'jubilant', def: 'feeling great joy and happiness', grade: 4 },
    { word: 'latitude', def: 'how far north or south a place is', grade: 4 },
    { word: 'literacy', def: 'the ability to read and write', grade: 4 },
    { word: 'membrane', def: 'a thin layer that covers or lines something', grade: 4 },
    { word: 'nominate', def: 'to suggest someone for a job or award', grade: 4 },
    { word: 'petition', def: 'a written request signed by many people', grade: 4 },
    { word: 'province', def: 'a large area that is part of a country', grade: 4 },
    { word: 'relocate', def: 'to move to a different place', grade: 4 },
    { word: 'scissors', def: 'a tool with two blades for cutting', grade: 4 },
    { word: 'abolish', def: 'to put an end to something officially', grade: 4 },
    { word: 'abstract', def: 'an idea not based on real things', grade: 4 },
    { word: 'abundant', def: 'more than enough of something', grade: 4 },
    { word: 'advocate', def: 'a person who speaks up for others', grade: 4 },
    { word: 'altitude', def: 'how high something is above the ground', grade: 4 },
    { word: 'ambition', def: 'a strong wish to achieve something', grade: 4 },
    { word: 'annotate', def: 'to add notes to explain something', grade: 4 },
    { word: 'antidote', def: 'a medicine that stops a poison', grade: 4 },
    { word: 'appetite', def: 'the feeling of wanting to eat food', grade: 4 },
    { word: 'applause', def: 'clapping hands to show you liked something', grade: 4 },
    { word: 'astonish', def: 'to surprise someone very much', grade: 4 },
    { word: 'attorney', def: 'a person who knows the law and helps people', grade: 4 },
    { word: 'balcony', def: 'a small platform on the side of a building', grade: 4 },
    { word: 'barnacle', def: 'a small sea creature that sticks to rocks', grade: 4 },
    { word: 'bilingual', def: 'able to speak two languages', grade: 4 },
    { word: 'boycott', def: 'to refuse to buy or use something', grade: 4 },
    { word: 'bulletin', def: 'a short news report or announcement', grade: 4 },
    { word: 'calendar', def: 'a chart that shows the days and months', grade: 4 },
    { word: 'capacity', def: 'the most something can hold', grade: 4 },
    { word: 'carnival', def: 'a fun outdoor event with rides and games', grade: 4 },
    { word: 'catalyst', def: 'something that makes a change happen faster', grade: 4 },
    { word: 'cautious', def: 'being very careful to avoid problems', grade: 4 },
    { word: 'champion', def: 'the winner of a contest or game', grade: 4 },
    { word: 'circular', def: 'shaped like a round circle', grade: 4 },
    { word: 'civilian', def: 'a regular person who is not in the army', grade: 4 },
    { word: 'coincide', def: 'to happen at the same time', grade: 4 },
    { word: 'commerce', def: 'the buying and selling of goods', grade: 4 },
    { word: 'complain', def: 'to say you are unhappy about something', grade: 4 },
    { word: 'compound', def: 'something made of two or more parts', grade: 4 },
    { word: 'confront', def: 'to face a problem or person directly', grade: 4 },
    { word: 'congress', def: 'a group of people who make laws', grade: 4 },
    { word: 'conquest', def: 'taking control by winning a battle', grade: 4 },
    { word: 'conserve', def: 'to use something carefully so it lasts', grade: 4 },
    { word: 'conspire', def: 'to plan something in secret with others', grade: 4 },
    { word: 'contrast', def: 'to show how things are different', grade: 4 },
    { word: 'corridor', def: 'a long hallway in a building', grade: 4 },
    { word: 'courtesy', def: 'polite and kind behavior toward others', grade: 4 },
    { word: 'critique', def: 'a careful review of someone\'s work', grade: 4 },
    { word: 'cylinder', def: 'a shape like a tube or can', grade: 4 },
    { word: 'deadline', def: 'the last day to finish something', grade: 4 },
    { word: 'deceive', def: 'to trick someone into believing a lie', grade: 4 },
    { word: 'declined', def: 'said no or became less over time', grade: 4 },
    { word: 'delegate', def: 'a person chosen to speak for a group', grade: 4 },
    { word: 'decisive', def: 'able to make choices quickly', grade: 4 },
    { word: 'diagnose', def: 'to find out what is wrong', grade: 4 },
    { word: 'dinosaur', def: 'a large reptile that lived long ago', grade: 4 },
    { word: 'diplomat', def: 'a person who represents their country', grade: 4 },
    { word: 'dissolve', def: 'to mix into liquid and disappear', grade: 4 },
    { word: 'dividend', def: 'a number to be divided by another', grade: 4 },
    { word: 'dominate', def: 'to have power or control over others', grade: 4 },
    { word: 'duration', def: 'how long something lasts', grade: 4 },
    { word: 'dynamics', def: 'the forces that cause movement or change', grade: 4 },
    { word: 'eligible', def: 'meeting the rules to be chosen', grade: 4 },
    { word: 'emblem', def: 'a symbol that stands for something', grade: 4 },
    { word: 'emigrate', def: 'to leave your country to live elsewhere', grade: 4 },
    { word: 'endeavor', def: 'to try hard to do something', grade: 4 },
    { word: 'engrave', def: 'to carve words or pictures into something', grade: 4 },
    { word: 'ensemble', def: 'a group that performs together', grade: 4 },
    { word: 'epidemic', def: 'a sickness that spreads to many people', grade: 4 },
    { word: 'equipped', def: 'having the tools needed for a job', grade: 4 },
    { word: 'exaggerate', def: 'to make something sound bigger than it is', grade: 4 },
    { word: 'excavate', def: 'to dig up something from the ground', grade: 4 },
    { word: 'factual', def: 'based on facts and true information', grade: 4 },
    { word: 'familiar', def: 'something you know or have seen before', grade: 4 },
    { word: 'feminine', def: 'having qualities linked to women or girls', grade: 4 },
    { word: 'fortress', def: 'a strong building made for defense', grade: 4 },
    { word: 'flourish', def: 'to grow well and be successful', grade: 4 },
    { word: 'forecast', def: 'to say what the weather will be like', grade: 4 },
    { word: 'formation', def: 'the way something is arranged or shaped', grade: 4 },
    { word: 'fugitive', def: 'a person running from the law', grade: 4 },
    { word: 'frontier', def: 'the far edge of settled land', grade: 4 },
    { word: 'galactic', def: 'having to do with a galaxy of stars', grade: 4 },
    { word: 'geometry', def: 'the math of shapes and angles', grade: 4 },
    { word: 'habitual', def: 'done regularly as a habit', grade: 4 },
    { word: 'handicap', def: 'something that makes a task harder', grade: 4 },
    { word: 'headline', def: 'the title at the top of a news story', grade: 4 },
    { word: 'heritage', def: 'traditions passed down through families', grade: 4 },
    { word: 'horrible', def: 'very bad or causing fear', grade: 4 },
    { word: 'hydrogen', def: 'a light gas found in water', grade: 4 },
    { word: 'hypothesize', def: 'to make a guess you can test', grade: 4 },
    { word: 'imperial', def: 'relating to an empire or ruler', grade: 4 },
    { word: 'indicate', def: 'to point out or show something', grade: 4 },
    { word: 'infantry', def: 'soldiers who fight on foot', grade: 4 },
    { word: 'innovate', def: 'to come up with new and better ideas', grade: 4 },
    { word: 'instinct', def: 'a natural feeling that guides behavior', grade: 4 },
    { word: 'interact', def: 'to talk or work with other people', grade: 4 },
    { word: 'interval', def: 'a space of time between two events', grade: 4 },
    { word: 'invasion', def: 'when an army enters another country', grade: 4 },
    { word: 'jeopardy', def: 'being in danger of harm or loss', grade: 4 },
    { word: 'kerosene', def: 'a fuel oil used in lamps and heaters', grade: 4 },
    { word: 'leverage', def: 'using a tool to gain more force', grade: 4 },
    { word: 'liberate', def: 'to set someone or something free', grade: 4 },
    { word: 'magnetic', def: 'able to attract metal objects', grade: 4 },
    { word: 'manifest', def: 'easy to see or understand clearly', grade: 4 },
    { word: 'maritime', def: 'having to do with the sea or ships', grade: 4 },
    { word: 'memorial', def: 'something built to remember a person', grade: 4 },
    { word: 'minimize', def: 'to make something as small as possible', grade: 4 },
    { word: 'monopoly', def: 'when one company controls all sales', grade: 4 },
    { word: 'nuisance', def: 'something that is annoying or bothersome', grade: 4 },
    { word: 'nitrogen', def: 'a gas that makes up most of the air', grade: 4 },
    { word: 'optimist', def: 'a person who expects good things', grade: 4 },
    { word: 'panorama', def: 'a wide view of a large area', grade: 4 },
    { word: 'paradise', def: 'a perfect and beautiful place', grade: 4 },
    { word: 'penalize', def: 'to punish someone for breaking a rule', grade: 4 },
  ];

  // ===================== Difficulty Progression =====================

  var DIFFICULTY_THRESHOLDS = [
    { after: 0, grade: 2 },
    { after: 8, grade: 3 },
    { after: 18, grade: 4 },
  ];

  /**
   * Return the max word grade the player should see,
   * based on how many words they have completed so far.
   */
  function getDifficulty(wordsCompleted) {
    var maxGrade = DIFFICULTY_THRESHOLDS[0].grade;
    for (var i = 0; i < DIFFICULTY_THRESHOLDS.length; i++) {
      if (wordsCompleted >= DIFFICULTY_THRESHOLDS[i].after) {
        maxGrade = DIFFICULTY_THRESHOLDS[i].grade;
      }
    }
    return maxGrade;
  }

  // ===================== Word Selection =====================

  /**
   * Pick a random word at or below the given grade, avoiding already-used indices.
   * Returns { word, def, grade, index } or null if no words remain.
   */
  function pickWord(maxGrade, usedIndices) {
    var candidates = [];
    for (var i = 0; i < WORDS.length; i++) {
      if (WORDS[i].grade <= maxGrade && usedIndices.indexOf(i) === -1) {
        candidates.push(i);
      }
    }
    if (candidates.length === 0) return null;

    var idx = candidates[Math.floor(Math.random() * candidates.length)];
    var entry = WORDS[idx];
    return { word: entry.word, def: entry.def, grade: entry.grade, index: idx };
  }

  /**
   * Pick a random character index in the word to blank out.
   * Returns an integer in [0, word.length - 1].
   */
  function pickMissingIndex(word) {
    return Math.floor(Math.random() * word.length);
  }

  // ===================== Guess Checking =====================

  /**
   * Check if the guessed letter matches the missing character (case-insensitive).
   */
  function checkGuess(word, missingIndex, guessedLetter) {
    return word[missingIndex].toLowerCase() === guessedLetter.toLowerCase();
  }

  // ===================== Keyboard Management =====================

  /**
   * Given the correct word, the missing index, and an array of wrong guesses,
   * return an array of uppercase letters that should be eliminated from the keyboard.
   *
   * After 1 wrong guess: remove 5 random incorrect letters.
   * After 2 wrong guesses: remove 5 more (10 total).
   * After 3 wrong guesses: remove 5 more (15 total).
   *
   * Removal is deterministic: uses the word + missingIndex to seed a
   * consistent shuffle so the same call always returns the same set.
   */
  function getEliminatedKeys(word, missingIndex, wrongGuesses) {
    var correctLetter = word[missingIndex].toUpperCase();
    var wrongSet = {};
    for (var i = 0; i < wrongGuesses.length; i++) {
      wrongSet[wrongGuesses[i].toUpperCase()] = true;
    }

    // Build pool of removable letters: not the correct letter, not already guessed wrong
    var removable = [];
    for (var i = 0; i < ALPHABET.length; i++) {
      var ch = ALPHABET[i];
      if (ch !== correctLetter && !wrongSet[ch]) {
        removable.push(ch);
      }
    }

    // Deterministic shuffle seeded by word + missingIndex
    var seed = 0;
    for (var i = 0; i < word.length; i++) {
      seed = ((seed * 31) + word.charCodeAt(i)) | 0;
    }
    seed = ((seed * 31) + missingIndex) | 0;

    // Simple seeded pseudo-random shuffle (LCG-based)
    function nextSeed(s) {
      return ((s * 1103515245 + 12345) & 0x7fffffff);
    }
    var s = Math.abs(seed);
    for (var i = removable.length - 1; i > 0; i--) {
      s = nextSeed(s);
      var j = s % (i + 1);
      var tmp = removable[i];
      removable[i] = removable[j];
      removable[j] = tmp;
    }

    // Number of keys to remove based on wrong guess count
    var wrongCount = wrongGuesses.length;
    var removeCount = Math.min(wrongCount * 5, removable.length);

    return removable.slice(0, removeCount);
  }

  // ===================== Session State =====================

  /** Create a fresh session object. */
  function createSession() {
    return {
      wordsCompleted: 0,
      wrongGuesses: 0,
      completedWords: [],
      usedIndices: [],
    };
  }

  /** Record a correct answer. Mutates session in place. */
  function recordCorrect(session, wordObj) {
    session.wordsCompleted++;
    session.completedWords.push(wordObj);
    if (wordObj.index !== undefined && session.usedIndices.indexOf(wordObj.index) === -1) {
      session.usedIndices.push(wordObj.index);
    }
  }

  /** Record a wrong guess. Mutates session in place. */
  function recordWrong(session) {
    session.wrongGuesses++;
  }

  // ===================== Public API =====================

  return {
    // Constants
    ALPHABET: ALPHABET,
    ROUND_DURATION: ROUND_DURATION,
    CORRECT_PAUSE: CORRECT_PAUSE,
    WRONG_PAUSE: WRONG_PAUSE,
    KEY_REMOVE_DELAY: KEY_REMOVE_DELAY,
    DIFFICULTY_THRESHOLDS: DIFFICULTY_THRESHOLDS,
    WORDS: WORDS,

    // Functions
    getDifficulty: getDifficulty,
    pickWord: pickWord,
    pickMissingIndex: pickMissingIndex,
    checkGuess: checkGuess,
    getEliminatedKeys: getEliminatedKeys,
    createSession: createSession,
    recordCorrect: recordCorrect,
    recordWrong: recordWrong,
  };
})();

// Support Node.js require for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlinkEngine;
}
