/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Plugin, PlayerID } from '../types';

interface PlayerData {
  players: Record<PlayerID, any>;
}

export interface PlayerAPI<PlayerState extends any = any> {
  state: Record<PlayerID, PlayerState>;
  get(): PlayerState;
  set(value: PlayerState): PlayerState;
  opponent?: {
    get(): PlayerState;
    set(value: PlayerState): PlayerState;
  };
}

interface PluginPlayerOpts {
  setup?: (playerID: string) => any;
}

export interface PlayerPlugin<PlayerState extends any = any> {
  player: PlayerAPI<PlayerState>;
}

/**
 * Plugin that maintains state for each player in G.players.
 * During a turn, G.player will contain the object for the current player.
 * In two player games, G.opponent will contain the object for the other player.
 *
 * @param {function} initPlayerState - Function of type (playerID) => playerState.
 */
const PlayerPlugin = ({ setup }: PluginPlayerOpts = {}): Plugin<
  PlayerAPI,
  PlayerData
> => ({
  name: 'player',

  flush: ({ api }) => {
    return { players: api.state };
  },

  api: ({ ctx, data }): PlayerAPI => {
    let state = data.players;

    const get = () => {
      return data.players[ctx.currentPlayer];
    };

    const set = value => {
      return (state[ctx.currentPlayer] = value);
    };

    let result: PlayerAPI = { state, get, set };

    if (ctx.numPlayers === 2) {
      const other = ctx.currentPlayer === '0' ? '1' : '0';
      const get = () => {
        return data.players[other];
      };
      const set = value => {
        return (state[other] = value);
      };
      result.opponent = { get, set };
    }

    return result;
  },

  setup: ({ ctx }) => {
    let players: Record<PlayerID, any> = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
      let playerState: any = {};
      if (setup !== undefined) {
        playerState = setup(i + '');
      }
      players[i + ''] = playerState;
    }
    return { players };
  },
});

export default PlayerPlugin;
