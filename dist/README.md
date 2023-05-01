# Magic Typewriter 

![Demo Image](https://raw.githubusercontent.com/oliverrees/magic-typewriter/main/Demo.gif)

A typewriter for react that includes:

- Emoji support (via the amazing [Grapheme Splitter](https://github.com/orling/grapheme-splitter))
- Smooth scrolling with CSS opacity
- No multi line snapping

# Installation

Add magic typewriter to your React project with npm

```
npm install --save magic-typewriter
```

# Basic Usage

Include magic typewriter and drop into any component

```
import { MagicTypewriter } from 'magic-typewriter';

function App() {
  return (
    <div className="App">
     <MagicTypewriter 
     message={"Hello there 👋\nHow are you doing today?"}
     ></MagicTypewriter>
    </div>
  );
}
```

# Options

There are several parameters you can use to customise magic typewriter

```
     <MagicTypewriter 
     message={"Hello there 👋\nHow are you doing today?"}
     splitLines={true}
     splitString={/\n/}
     onComplete={() => console.log('Done')}
     isLoading={false}
     charDelay={30}
     lineDelay={500}
     ></MagicTypewriter>
```
