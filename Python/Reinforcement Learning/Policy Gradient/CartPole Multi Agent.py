# CartPole Multi Agents - Policy Gradients

# Importing Libraries
import gym
import numpy as np
import tensorflow as tf
import concurrent.futures as fut  # for concurrently running different agents
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Dropout

# To ensure all layers have same data type
tf.keras.backend.set_floatx('float64')


# Creating a class for model
class GymModel(Model):
    def __init__(self, a, b):
        super(GymModel, self).__init__()
        self.d1 = Dense(10, activation='relu', input_shape=(4,))
        self.d2 = Dense(20, activation='relu')
        self.d3 = Dense(10, activation='relu')
        self.op = Dense(2)

    def call(self, x):
        x = self.d1(x)
        x = self.d2(x)
        x = self.d3(x)
        return self.op(x)


# Creating class for our Agent
class CartAgent:
    def __init__(self, brain):
        self.brain = brain
        self.env = gym.make('CartPole-v1')
        self.obs = self.env.reset()
        self.done = False
        self.rewards = 0
        self.epi_obs = []  # episode observations
        self.epi_acts = []  # episode actions
        self.epi_res = []  # episode rewards

    def explore(self):
        while not self.done:
            # Gathering experiences for 'Experience Replay'
            if len(self.epi_obs) > 100:
                self.epi_acts.pop(0)
                self.epi_obs.pop(0)
                self.epi_res.pop(0)

            self.epi_obs.append(self.obs)

            actions = brain.call(self.obs.reshape(1, 4))
            actions = tf.nn.softmax(actions).numpy()[0]
            # selecting action based on the probability
            a = np.random.choice(range(len(actions)), p=actions)

            self.obs, re, self.done, _ = self.env.step(a)
            self.rewards += re

            act = np.zeros(2)
            act[a] = 1.0
            self.epi_acts.append(act)
            self.epi_res.append(re)

            if self.done:
                break

        return self.rewards

    def train(self):
        if self.rewards <= 480:
            norm_rewards = normalized_and_discounted_rewards(self.epi_res)
            train_step(np.array(self.epi_obs), np.array(
                self.epi_acts), norm_rewards)

    def reset(self):
        self.obs = self.env.reset()
        self.done = False
        self.rewards = 0
        self.epi_obs = []
        self.epi_acts = []
        self.epi_res = []


# function to render the outcome
def render():
    rre = 0
    rdone = False
    robs = env.reset()
    while not rdone:
        env.render()
        ractions = brain.call(robs.reshape(1, 4))
        ractions = np.argmax(tf.nn.softmax(ractions).numpy()[0])
        robs, re, rdone, _ = env.step(ractions)
        rre += re
    env.close()
    print(f"Rendering Rewards: {rre}")


# function used to normailze and discount rewards
def normalized_and_discounted_rewards(rewards):
    r = 0
    discount = np.zeros_like(rewards)
    for i in reversed(range(len(rewards))):
        r = gamma * r + rewards[i]
        discount[i] = r

    return (discount - discount.mean())/discount.std()


# Calculate loss based on the reward it gets
def gym_loss(y_true, predict, rewards):
    neg_loss = tf.nn.softmax_cross_entropy_with_logits(
        labels=y_true, logits=predict)
    return tf.reduce_mean(rewards * neg_loss)


# training step
def train_step(ip, op, rewards):
    with tf.GradientTape() as tape:
        pred = brain(ip)
        loss_value = gym_loss(op, pred, rewards)
    # calculating the gradient for all the model variables wrt loss
    grad = tape.gradient(loss_value, brain.trainable_variables)
    # applying the gradients to all the model variables
    optimizer.apply_gradients(zip(grad, brain.trainable_variables))


# parameters
lr = 0.01  # learning rate a.k.a alpha
gamma = 0.9  # discount rate
env = gym.make('CartPole-v1')  # used to render the final outcome
total_episodes = 101  # total number of episodes our multi-agents trained for

# optimizer used to optimize the model hyperparameters
optimizer = tf.keras.optimizers.Adam(learning_rate=lr)
brain = GymModel(4, 2)  # brain or neural net used for all the agents
num_agents = 5  # no. of agents
agents = [CartAgent(brain) for i in range(num_agents)]


# Training Starts
for epi in range(51):
    for agent in agents:
        agent.reset()  # reset the environments for all the agents
        agent.explore()  # don't remove this line otherwise it's showing some unexpected errors!!

    # exploration starts
    while True:
        # using concurrent Thread Pool Executer
        with fut.ThreadPoolExecutor() as ex:
            agent_explore = [ex.submit(agent.explore) for agent in agents]

        # 'train_step' would be executed after all the agents are done exploring
        if all([agent.done for agent in agents]):
            # execution 'train_step' one by one to ensure optimization go in optimal direction
            for agent in agents:
                if agent.rewards <= 480:
                    norm_re = normalized_and_discounted_rewards(agent.epi_res)
                    train_step(np.array(agent.epi_obs),
                               np.array(agent.epi_acts), norm_re)
            break

    # If all the agents have scored more than 480 then training is done.
    if all([agent.rewards > 480 for agent in agents]):
        print(
            f"Training done in {epi+1} episodes with rewards {[agent.rewards for agent in agents]}!!")
        # render()
        break

    if epi % 10 == 0:
        print(
            f"Episode {epi+1} finished with rewards {[agent.rewards for agent in agents]}")
