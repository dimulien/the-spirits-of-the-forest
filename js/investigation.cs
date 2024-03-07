Dictionary<Coord, Cell> board;

for (int distance = 1; distance <= Config.MAP_RING_COUNT; distance++)
{
    for (int orientation = 0; orientation < 6; orientation++) 
    {
        for (int count = 0; count < distance; count++)
        {
            var richness = GetRichnessByDistance(distance);
            var cell = new Cell(richness);
            board.Add(coord, cell);

            coord = coord.neighbor((orientation + 2) % 6);
        }
    }
    coord = coord.neighbor(0);
}

private string GetRichnessByDistance(int distance)
{
    var richness = Constants.RICHNESS_LUSH;

    if (distance == Config.MAP_RING_COUNT) 
    {
        richness = Constants.RICHNESS_POOR;
    }
    else if (distance == Config.MAP_RING_COUNT - 1) 
    {
        richness = Constants.RICHNESS_OK;
    }
            
    return richness;        
}