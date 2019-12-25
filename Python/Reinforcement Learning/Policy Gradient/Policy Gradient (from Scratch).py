# Implementing Policy Gradient (Reinforcement Learning Algorithm) in OpenAI-gym's Environment, "CartPole-v1".
# __author__ = Dishant Varshney
# Neural Network code is inspired by "Grokking Deep Learning" book by Andrew Trask

# Importing Libraries
import gym
import numpy as np
import matplotlib.pyplot as plt


# Creating Neural Network classS
class NN:
    def __init__(self, a, b, c):
        self.w_ih = np.random.uniform(-0.2, 0.2, (a, b))
        self.b_ih = np.random.uniform(-0.2, 0.2, (1, b))
        self.w_ho = np.random.uniform(-0.2, 0.2, (b, c))
        self.b_ho = np.random.uniform(-0.2, 0.2, (1, c))

    def relu(self, x):
        return (x > 0) * x

    def relu2der(self, x):
        return x > 0

    def softmax(self, x):
        temp = np.exp(x - np.max(x))
        return temp / np.sum(temp, axis=1, keepdims=True)

    def train(self, ip, op, rewards):
        ip = np.array(ip)
        op = np.array(op)
        rewards = np.array(rewards)

        for i in range(len(ip)):
            l0 = ip[i:i + 1]
            l1 = self.relu(np.add(np.matmul(l0, self.w_ih), self.b_ih))
            l2 = self.softmax(np.add(np.matmul(l1, self.w_ho), self.b_ho))

            # Cost function: (true ouput - predicted output)
            l2_delta = rewards[i] * (l2 - op[i:i + 1]) / (l2.shape[0])
            l1_delta = np.matmul(l2_delta, self.w_ho.T) * self.relu2der(l1)

            # updating weights according to the gradient of the loss
            self.w_ho -= lr * np.matmul(l1.T, l2_delta)
            self.w_ih -= lr * np.matmul(l0.T, l1_delta)

            self.b_ho -= lr * l2_delta
            self.b_ih -= lr * l1_delta

    def predict(self, ip):
        l0 = np.atleast_2d(ip)
        l1 = self.relu(np.add(np.matmul(l0, self.w_ih), self.b_ih))
        return self.softmax(np.add(np.matmul(l1, self.w_ho), self.b_ho))[0]


# Defining Render function which is used to render the output after the training completes
def render():
    robs = env.reset()
    rdone = False
    rrewards = 0
    while not rdone:
        env.render()
        robs, rr, rdone, _ = env.step(np.argmax(brain.predict(robs)))
        rrewards += rr
    env.close()
    print(f"Rendering rewards: {rrewards}")


# Normalizing and discountig the rewards
def normalized_and_discounted_rewards(rewards):
    re = 0
    discountedrewards = np.zeros_like(rewards)

    for i in reversed(range(len(rewards))):
        re = gamma * re + rewards[i]
        discountedrewards[i] = re
    return (discountedrewards - discountedrewards.mean()) / discountedrewards.std()


# Some Variables
env = gym.make('CartPole-v1')
obs_size = 4  # observation space size
action_size = 2  # action space size
lr = 0.01  # learning rate a.k.a alpha
# gamma or discount factor (which is used to determine whether agent considers future awards)
gamma = 0.95
total_episodes = 301  # total number of times iterative process goes
brain = NN(obs_size, 10, action_size)  # brain of the agent (Neural Network)

# Training Starts
# Storing states, rewards, actions for Experience Replay
epi_actions = []
epi_rewards = []
epi_obs = []
total_rewards = []

for episode in range(total_episodes):
    obs = env.reset()  # resetting the environment
    reward = 0
    done = False

    while True:
        # length of Experience Replay is limited to 100 values
        if len(epi_actions) > 100:
            epi_actions.pop(0)
            epi_obs.pop(0)
            epi_rewards.pop(0)

        epi_obs.append(obs)

        actions = brain.predict(obs)
        # Instead of defining separate epsilon (e as in epsilon-greedy)  to do exploitation vs exploration.
        # I am using probability of choosing the action. (The output of the predict function is softmax which gives the probability of each event)
        choose_act = np.random.choice(range(len(actions)), p=actions)
        action_ = np.zeros(action_size)
        #  one hot encoding
        action_[choose_act] = 1.0

        obs, r, done, _ = env.step(choose_act)
        reward += r
        epi_rewards.append(r)
        epi_actions.append(action_)

        if done:
            total_rewards.append(reward)
            # if reward in an episode is greater than some threshold (here, 480) then updating weights is not necessary as the agent learned enough
            if reward <= 480:
                discounted_rewards = normalized_and_discounted_rewards(
                    epi_rewards)
                brain.train(epi_obs, epi_actions, discounted_rewards)
            break

    # printing the result at each 100th iteratin
    if episode % 100 == 0:
        print(f"At Episode: {episode}, Total Rewards: {reward}")
    # if reward of an episode is greater than 480 then render the agent's learning to confirm no overfitting!
    if reward > 480:
        print(f"Done in {episode} episodes with total rewards {reward}")
        render()
        # plotting how the agent gets the reward at each iteration
        plt.plot(total_rewards)
        plt.show()
        break
