namespace API.Entities
{
    public class Connection
    {
        // generate default constructor for entity framework when creating tables
        // might cause an error
        public Connection()
        {
        }

        public Connection(string connectionId, string username)
        {
            ConnectionId = connectionId;
            Username = username;
        }

        // if given the ClassName + 'Id' -> EF will automatically treat this as the primary key
        public string ConnectionId { get; set; }
        public string Username { get; set; }
    }
}