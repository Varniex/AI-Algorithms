# CartPole - Policy Gradient

# Importing Libraries
import gym
import numpy as np
import tensorflow as tf
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


# function to render the outcome
def render():
    rre = 0
    rdone = False
    robs = env.reset()
    while not rdone:
        env.render()
        ractions = model.call(robs.reshape(1, 4))
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
        pred = model(ip)
        loss_value = gym_loss(op, pred, rewards)
    # calculating the gradient for all the model variables wrt loss
    grad = tape.gradient(loss_value, model.trainable_variables)
    # applying the gradients to all the model variables
    optimizer.apply_gradients(zip(grad, model.trainable_variables))


# parameters
lr = 0.01  # learning rate a.k.a alpha
gamma = 0.9  # discount rate
env = gym.make('CartPole-v1')  # gym environment
total_episodes = 301  # total number of episodes

# optimizer used to optimize the model hyperparameters
optimizer = tf.keras.optimizers.Adam(learning_rate=lr)
model = GymModel(4, 2)  # model used to train the agent
max_rewards = 0


# Training Starts
for epi in range(total_episodes):
    obs = env.reset()
    done = False
    total_rewards = 0
    # for 'Experience Replay'
    epi_rewards = []  # episode rewards
    epi_obs = []  # episode observations
    epi_actions = []  # episode actions

    # Exploration Starts
    while (True):
        epi_obs.append(obs)

        actions = model.call(obs.reshape(1, 4))
        actions = tf.nn.softmax(actions).numpy()[0]
        # selecting action based on the probability
        choose_act = np.random.choice(range(len(actions)), p=actions)
        action_ = np.zeros(2)
        action_[choose_act] = 1.0

        obs, re, done, _ = env.step(choose_act)
        total_rewards += re

        epi_actions.append(action_)
        epi_rewards.append(re)

        if done:  # if agent is done exploring, 'train_step' would execute
            max_rewards = max(total_rewards, max_rewards)
            if total_rewards <= 480:
                rewards = normalized_and_discounted_rewards(epi_rewards)
                train_step(np.array(epi_obs), np.array(epi_actions), rewards)
            break

    if (epi % 100 == 0):
        print(
            f"Iter: {epi}, Rewards: {total_rewards}, Max Rewards: {max_rewards}")
    if (total_rewards > 480):
        print(f"Done in {epi} episodes with total reward {total_rewards}")
        # render()
        break
