# Cart Pole Neuro Evolution

_@auhtor: Dishant Varshney_

This is the replica of **OpenAI Gym's 'CartPole-v1'** environment made in JavaScript with p5.js library where the agent learns to balance the pole on a cart through genetic algorithm.

Unlike OpenAI Gym's version, this has infinite number of steps but has the same conditions for the failure of the episode i.e.,

1. The agent fails to balance the pole if pole is titled more than 15 degrees from the vertical or
2. The cart moves 2.4 units from the center. In addition to this, there is one more condition I added in my version

The agent gets a reward of +1 for every successful step.

_Disclaimer: You are free to use the CartPoleEnv.js file to make your own agent learns in this environment as long as you mention the author's name._
