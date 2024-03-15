using System;
using System.Linq;
using System.IO;
using System.Text;
using System.Collections;
using System.Collections.Generic;

class Player
{
    static void Main(string[] args)
    {
        string[] inputs;

        Game game = new Game();

        int numberOfCells = int.Parse(Console.ReadLine()); // 37
        for (int i = 0; i < numberOfCells; i++)
        {
            inputs = Console.ReadLine().Split(' ');
            int index = int.Parse(inputs[0]); // 0 is the center cell, the next cells spiral outwards
            int richness = int.Parse(inputs[1]); // 0 if the cell is unusable, 1-3 for usable cells
            int neigh0 = int.Parse(inputs[2]); // the index of the neighbouring cell for each direction
            int neigh1 = int.Parse(inputs[3]);
            int neigh2 = int.Parse(inputs[4]);
            int neigh3 = int.Parse(inputs[5]);
            int neigh4 = int.Parse(inputs[6]);
            int neigh5 = int.Parse(inputs[7]);
            int[] neighs = new int[] { neigh0, neigh1, neigh2, neigh3, neigh4, neigh5 };
            Cell cell = new Cell(index, richness, neighs);
            game.board.Add(cell);
        }

        // game loop
        while (true)
        {
            game.day = int.Parse(Console.ReadLine()); // the game lasts 24 days: 0-23
            game.nutrients = int.Parse(Console.ReadLine()); // the base score you gain from the next COMPLETE action
            inputs = Console.ReadLine().Split(' ');
            game.mySun = int.Parse(inputs[0]); // your sun points
            game.myScore = int.Parse(inputs[1]); // your current score
            inputs = Console.ReadLine().Split(' ');
            game.opponentSun = int.Parse(inputs[0]); // opponent's sun points
            game.opponentScore = int.Parse(inputs[1]); // opponent's score
            game.opponentIsWaiting = inputs[2] != "0"; // whether your opponent is asleep until the next day

            game.trees.Clear();
            int numberOfTrees = int.Parse(Console.ReadLine()); // the current amount of trees
            for (int i = 0; i < numberOfTrees; i++)
            {
                inputs = Console.ReadLine().Split(' ');
                int cellIndex = int.Parse(inputs[0]); // location of this tree
                int size = int.Parse(inputs[1]); // size of this tree: 0-3
                bool isMine = inputs[2] != "0"; // 1 if this is your tree
                bool isDormant = inputs[3] != "0"; // 1 if this tree is dormant
                Tree tree = new Tree(cellIndex, size, isMine, isDormant);
                game.trees.Add(tree);
            }

            game.possibleActions.Clear();
            int numberOfPossibleMoves = int.Parse(Console.ReadLine());
            for (int i = 0; i < numberOfPossibleMoves; i++)
            {
                string possibleMove = Console.ReadLine();
                game.possibleActions.Add(Action.Parse(possibleMove));
            }

            Action action = game.GetNextAction();
            Console.WriteLine(action);
        }
    }
}

public class Cell
{
    public int index;
    public int richness;
    public int[] neighbours;

    public Cell(int index, int richness, int[] neighbours)
    {
        this.index = index;
        this.richness = richness;
        this.neighbours = neighbours;
    }
}

public class Tree
{
    public int cellIndex;
    public int size;
    public bool isMine;
    public bool isDormant;

    public Tree(int cellIndex, int size, bool isMine, bool isDormant)
    {
        this.cellIndex = cellIndex;
        this.size = size;
        this.isMine = isMine;
        this.isDormant = isDormant;
    }
}

public class Action
{
    public const string WAIT = "WAIT";
    public const string SEED = "SEED";
    public const string GROW = "GROW";
    public const string COMPLETE = "COMPLETE";

    public static Action Parse(string action)
    {
        string[] parts = action.Split(" ");
        switch (parts[0])
        {
            case WAIT:
                return new Action(WAIT);
            case SEED:
                return new Action(SEED, int.Parse(parts[1]), int.Parse(parts[2]));
            case GROW:
            case COMPLETE:
            default:
                return new Action(parts[0], int.Parse(parts[1]));
        }
    }

    public string type;
    public int targetCellIdx;
    public int sourceCellIdx;

    public Action(string type, int sourceCellIdx, int targetCellIdx)
    {
        this.type = type;
        this.targetCellIdx = targetCellIdx;
        this.sourceCellIdx = sourceCellIdx;
    }

    public Action(string type, int targetCellIdx)
        : this(type, 0, targetCellIdx)
    {
    }

    public Action(string type)
        : this(type, 0, 0)
    {
    }

    public override string ToString()
    {
        if (type == WAIT)
        {
            return Action.WAIT;
        }
        if (type == SEED)
        {
            return string.Format("{0} {1} {2}", SEED, sourceCellIdx, targetCellIdx);
        }
        return string.Format("{0} {1}", type, targetCellIdx);
    }
}

public class Game
{
    public int day;
    public int nutrients;
    public List<Cell> board;
    public List<Action> possibleActions;
    public List<Tree> trees;
    public int mySun, opponentSun;
    public int myScore, opponentScore;
    public bool opponentIsWaiting;

    public Game()
    {
        board = new List<Cell>();
        possibleActions = new List<Action>();
        trees = new List<Tree>();
    }


    // *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_/*

    

    /* 
    TODO: Need to use minimax method. Calculate value of each turn.
    Define depth of calculation and find better move.
    So need to able to measure current state
    And compare value of states.
    */
    // *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_

    public Action GetNextAction()
    {
        Action best = possibleActions.First();
        double bestScore = 0.0;
        foreach (Action a in possibleActions)
        {
            double currentScore = _GetActionScore(a);

            //if (currentScore > 0.0)
                Console.Error.WriteLine("Action: " + a.ToString() + " Score: " + currentScore.ToString());

            if (currentScore > bestScore)
            {
                best = a;
                bestScore = currentScore;
            }
        }

        return best;
    }

    // Private methods

    // Check Cell by specified ID, whether our trees cast shadow to the Cell.
    // It's used only for SEED action, because I strive to seed new tree without shadow of my trees.
    private bool _IsShadow(int id)
    {
        bool result = true;

        List<int> shadows = new List<int>();

        foreach (Tree t in trees.FindAll(tr => tr.isMine))
        {
            Cell currentCell = board.Find(c => c.index == t.cellIndex);

            for (int i = 0; i < 6; i++)
            { 
                int shadowLength = (i == 0 || i == 3) ? 3 : 2;
                //int shadowLength = 3;
                shadows.AddRange(_CastShadowOnDirection(currentCell, i, shadowLength));
            }
        }

        result = shadows.Contains(id);

        return result;
    }

    // Gets number of gathering sun for specified sun direction and for the list of trees.
    private int _GatheringSun (List<Tree> playerTrees, int sunDirection)
    {
        int result = 0;
        // Get all shadows.
        Dictionary<int, List<int>> shadows = new Dictionary<int, List<int>>();
        foreach (Tree t in this.trees.FindAll(t => t.size != 0))
        {
            Cell currentCell = board.Find(c => c.index == t.cellIndex);
            List<int> currentShadows = _CastShadowOnDirection(currentCell, sunDirection, t.size);

            if (shadows.ContainsKey(t.size))
            {
                shadows[t.size].AddRange(currentShadows);
            }
            else
            {
                shadows.Add(t.size, currentShadows);
            }
        }

        foreach (Tree t in playerTrees)
        {
            bool isShadow = false;
            for (int i = t.size; i <= 3; i++)
            {
                if (shadows.ContainsKey(i) &&
                    shadows[i].Contains(t.cellIndex))
                {
                    isShadow = true;
                    break;
                }
            }

            if (!isShadow)
                result += t.size;
        }

        return result;
    }


    private List<int> _CastShadowOnDirection(Cell tree, int direction, int count)
    {
        List<int> result = new List<int>();

        Cell currentCell = tree;
        for (int s = 0; s < count; s++)
        {
            int neighId = currentCell.neighbours[direction];
            if (neighId != -1)
            {
                result.Add(neighId);
                currentCell = board.Find(c => c.index == neighId);
            }
        }

        return result;
    }
    
    private double _GetActionScore(Action action)
    {
        double result = 0.0;

        if (_IsLastDay())
        {
            switch(action.type)
            {
                case Action.COMPLETE:
                    int richness = _GetCellRichness(action.targetCellIdx);
                    if (nutrients > 1 || richness > 1)
                        result = richness * 10;
                    break;
                case Action.SEED:
                    if (!_IsShadow(action.targetCellIdx) && !trees.Exists(t => t.isMine && t.size == 0))
                    {
                        result += _GetCellRichness(action.targetCellIdx) * 0.5;
                    }
                    break;
                case Action.GROW:
                case Action.WAIT:
                default:
                    break;
            }
        }
        else
        {
            // TODO: Need to count efficient of tree. 
            // Take remaining rounds and current nutrients into account.
            // Take opponent trees into account.

            switch(action.type)
            {
                case Action.SEED:
                    if (!_IsShadow(action.targetCellIdx) && !trees.Exists(t => t.isMine && t.size == 0))
                    {
                        result += _GetCellRichness(action.targetCellIdx) * 0.5;
                    }
                    break;
                case Action.GROW:
                    int treeSize = _GetTreeSize(action.targetCellIdx) + 1;

                    if (day == LAST_DAY - 1)
                    {
                        // Evaluate action.
                        int tempMySun = mySun;
                        mySun -= (int)Math.Pow(2, treeSize) - 1 + trees.FindAll(t => t.isMine && t.size == treeSize).Count;
                        Tree current = trees.Find(t => t.cellIndex == action.targetCellIdx);
                        current.size++;
                        result = _GetScoreOfState();

                        mySun = tempMySun;
                        current.size--;
                    }
                    else
                    {
                        result += (double)_GetCellRichness(action.targetCellIdx) * 0.5;
                        result += treeSize;
                        result -= (double)trees.FindAll(t => t.isMine && t.size == treeSize).Count * 0.3;

                        if (LAST_DAY < day + 4 - treeSize)
                            result = 0.0;
                    }


                    break;
                case Action.COMPLETE:
                    if (day == LAST_DAY - 1)
                    {
                        // Evaluate action.
                        int tempMySun = mySun;
                        int tempNutrient = nutrients;
                        
                        Tree current = trees.Find(t => t.cellIndex == action.targetCellIdx);
                        result = nutrients + (int)Math.Pow(2, _GetCellRichness(current.cellIndex) - 1);
                        nutrients--;
                        mySun -= 4;
                        
                        trees.Remove(current);

                        Console.Error.WriteLine("COMPLETE");
                        result += _GetScoreOfState();
                        
                        trees.Add(current);
                        mySun = tempMySun;
                        nutrients = tempNutrient;
                    }
                    else if (!_OpponentWillNotComplete())
                    {
                        int richness = _GetCellRichness(action.targetCellIdx);
                        if (nutrients > 0 || richness > 1)
                        {
                            result = richness * 1;
                            result += (double)trees.FindAll(t => t.isMine && t.size == 3).Count * 0.2;
                            
                            result -= (LAST_DAY - day) * 0.3;
                        }
                    }
                    break;
                case Action.WAIT:
                    if (day == LAST_DAY - 1)
                    {
                        Console.Error.WriteLine("Wait");
                        result = _GetScoreOfState();
                    }

                    break;
                default:
                    break;
            }
        }

        return result;
    }

    private int _GetScoreOfState ()
    {
        int myScore = _GetScoreTest(trees.FindAll(t => t.isMine), mySun);
        Console.Error.WriteLine("My score: " + myScore.ToString());
        int opScore = _GetScoreTest(trees.FindAll(t => !t.isMine), opponentSun);
        Console.Error.WriteLine("Opp score: " + opScore.ToString());
        return 20 + myScore - opScore;
    }

    private int _GetScoreTest (List<Tree> scoreTrees, int suns)
    {
        Console.Error.WriteLine("tree count: " + scoreTrees.ToString());
        int result = 0;
        int tempNutrients = nutrients;

        int gatheringSunCount = _GatheringSun(scoreTrees, (day + 1) % 6);
        Console.Error.WriteLine("gatheringSunCount: " + gatheringSunCount.ToString());

        int tempMySun = gatheringSunCount + suns;
        Console.Error.WriteLine("tempMySun: " + tempMySun.ToString());
        List<Tree> trees3 = scoreTrees.FindAll(t => t.size == 3);
        Console.Error.WriteLine("trees3.Count: " + trees3.Count.ToString());
        int completeNumber = Math.Min((tempMySun) / 4, trees3.Count);

        List<int> richnessTrees = new List<int>();

        foreach (Tree t in trees3)
        {
            richnessTrees.Add(_GetCellRichness(t.cellIndex));
        }

        richnessTrees.OrderByDescending(i => i);
        
        Console.Error.WriteLine("completeNumber: " + completeNumber.ToString());
        for (int i = 0; i < completeNumber; i++)
        {
            int currentValue = (int)Math.Pow(2, richnessTrees[i] - 1) + tempNutrients;
            if (currentValue == 1)
            {
                completeNumber -= (completeNumber - i);
                break;
            }

            result += currentValue;
            
            if (tempNutrients > 0)
                tempNutrients--;
            else
                tempNutrients = 0;

        }
        Console.Error.WriteLine("result: " + result.ToString());
        result += (tempMySun - completeNumber * 4) / 3;
        Console.Error.WriteLine("result: " + result.ToString());
        return result;
    }

    private bool _OpponentWillNotComplete()
    {
        bool result = false;

        List<Tree> opTrees = trees.FindAll(t => !t.isMine && t.size == 3);
        List<Tree> myTrees = trees.FindAll(t => t.isMine && t.size == 3);

        if (day > 16)
        {
            if (3 * opTrees.Count > myTrees.Count)
            {
                result = false;
            }
            else
            {
                result = true;
            }
        }

        return result;
    }

    private int _GetTreeSize(int id)
    {
        return trees.Find(t => t.cellIndex == id).size;
    }


    private int _GetCellRichness(int id)
    {
        return board.Find(c => c.index == id).richness;
    }

    private bool _IsLastDay()
    {
        return day == LAST_DAY;
    }

    private const int LAST_DAY = 23;
}