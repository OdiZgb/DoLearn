using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoLearn.API.Migrations
{
    /// <inheritdoc />
    public partial class capacityToCourse002 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Capacity",
                table: "Courses",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Capacity",
                table: "Courses");
        }
    }
}
